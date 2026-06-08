const fs = require('fs');
const path = require('path');

// Load environment variables from .env
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      });
    }
  } catch (error) {
    console.error('Warning: Failed to load .env file:', error.message);
  }
}

loadEnv();

const ROADMAPS_DIR = path.join(__dirname, '..', 'public', 'data', 'roadmaps');
const DOCS_DIR = path.join(__dirname, '..', 'public', 'data', 'docs');

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Retrieve API Keys
const apiKeys = [];
let idx = 1;
while (true) {
  const envName = idx === 1 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY_${idx}`;
  const keyVal = process.env[envName];
  if (!keyVal) {
    break;
  }
  apiKeys.push(keyVal);
  idx++;
}

if (apiKeys.length === 0) {
  console.error('Error: No GEMINI_API_KEY variables found in .env');
  process.exit(1);
}

console.log(`Enricher initialized with ${apiKeys.length} API keys.`);

// Helper to make API calls to Gemini
async function callGemini(apiKey, prompt, schema) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error [${response.status}]: ${errorText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned empty response.');
  }

  return JSON.parse(text);
}

// Sleep utility
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Phase 1 Schema definitions
const stagesSchema = {
  type: 'OBJECT',
  properties: {
    id: { type: 'STRING' },
    title: { type: 'STRING' },
    description: { type: 'STRING' },
    stages: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          step: { type: 'INTEGER' },
          title: { type: 'STRING' },
          topics: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                name: { type: 'STRING' },
                tag: { type: 'STRING', enum: ['essential', 'advanced'] },
                description: { type: 'STRING' },
                resources: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      url: { type: 'STRING' },
                      type: { type: 'STRING', enum: ['video', 'article', 'course'] }
                    },
                    required: ['title', 'url', 'type']
                  }
                }
              },
              required: ['id', 'name', 'tag', 'description', 'resources']
            }
          },
          project: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              description: { type: 'STRING' },
              url: { type: 'STRING' }
            },
            required: ['title', 'description']
          }
        },
        required: ['step', 'title', 'topics']
      }
    }
  },
  required: ['id', 'title', 'description', 'stages']
};

const treeSchema = {
  type: 'OBJECT',
  properties: {
    id: { type: 'STRING' },
    title: { type: 'STRING' },
    description: { type: 'STRING' },
    format: { type: 'STRING', enum: ['tree'] },
    tree: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          name: { type: 'STRING' },
          tag: { type: 'STRING', enum: ['essential', 'advanced'] },
          description: { type: 'STRING' },
          resources: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                url: { type: 'STRING' },
                type: { type: 'STRING', enum: ['video', 'article', 'course'] }
              },
              required: ['title', 'url', 'type']
            }
          },
          children: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                name: { type: 'STRING' },
                tag: { type: 'STRING', enum: ['essential', 'advanced'] },
                description: { type: 'STRING' },
                resources: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      url: { type: 'STRING' },
                      type: { type: 'STRING', enum: ['video', 'article', 'course'] }
                    },
                    required: ['title', 'url', 'type']
                  }
                }
              },
              required: ['id', 'name', 'tag', 'description', 'resources']
            }
          }
        },
        required: ['id', 'name', 'tag', 'description', 'resources', 'children']
      }
    }
  },
  required: ['id', 'title', 'description', 'format', 'tree']
};

const phase2Schema = {
  type: 'OBJECT',
  properties: {
    needsLocalGuide: { type: 'BOOLEAN' },
    documentation: { type: 'STRING' },
    youtubeResources: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          url: { type: 'STRING' },
          type: { type: 'STRING', enum: ['video'] }
        },
        required: ['title', 'url', 'type']
      }
    }
  },
  required: ['needsLocalGuide', 'documentation', 'youtubeResources']
};

// Helper to extract list of topics from a roadmap JSON
function getTopicsList(roadmap) {
  const list = [];
  function collect(node) {
    if (node.id && node.name) {
      list.push(node);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(collect);
    }
  }

  if (roadmap.format === 'tree' && Array.isArray(roadmap.tree)) {
    roadmap.tree.forEach(collect);
  } else if (Array.isArray(roadmap.stages)) {
    roadmap.stages.forEach(stage => {
      if (Array.isArray(stage.topics)) {
        stage.topics.forEach(collect);
      }
    });
  }
  return list;
}

// Main logic for Phase 1: Structure Optimization
async function processPhase1(fileName, apiKey, workerId) {
  const slug = fileName.replace(/\.json$/, '');
  const roadmapPath = path.join(ROADMAPS_DIR, fileName);
  
  let roadmap;
  try {
    roadmap = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
  } catch (err) {
    console.error(`[Worker ${workerId}][ERROR] Failed to read ${fileName}:`, err.message);
    return null;
  }

  // Check if already fully processed (has doc resources for all topics)
  const topics = getTopicsList(roadmap);
  const isComplete = topics.length > 0 && topics.every(t => 
    Array.isArray(t.resources) && t.resources.some(r => r.type === 'doc')
  );

  if (isComplete) {
    console.log(`[Worker ${workerId}][SKIPPED] ${slug} is already fully enriched.`);
    return { file: fileName, slug, roadmap, skipPhase2: true };
  }

  console.log(`[Worker ${workerId}][PHASE 1 START] Restructuring/Optimizing roadmap nodes for: ${slug}`);

  const isTree = roadmap.format === 'tree';
  const prompt = `You are a Principal Curriculum Designer at SkillBun.
Your task is to review the following career roadmap. If the topics list is generic, shallow, or outdated, update it to make it highly meaningful, structured, in-depth, and comprehensive for industry standards.

Roadmap Title: ${roadmap.title}
Roadmap Description: ${roadmap.description}
Current Structure:
${JSON.stringify(roadmap, null, 2)}

Requirements:
1. Ensure all stages/levels flow logically from absolute fundamentals to advanced industry production.
2. If topics are too brief or generic, rename them, expand their descriptions, or split/add new essential sub-topics.
3. Every topic must have a clean, unique 'id' (using alphanumeric and underscores, e.g., 'fe_internet_basics').
4. Keep the existing format (${isTree ? 'tree' : 'stages'}). Do not change the format type of the file.
5. In your response, preserve all properties of the roadmap, returning the fully optimized schema matching the input format. Do not modify the roadmap ID.`;

  const schema = isTree ? treeSchema : stagesSchema;
  const maxRetries = 6;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const optimizedRoadmap = await callGemini(apiKey, prompt, schema);
      
      // Save Phase 1 optimized roadmap
      fs.writeFileSync(roadmapPath, JSON.stringify(optimizedRoadmap, null, 2), 'utf8');
      console.log(`[Worker ${workerId}][PHASE 1 SUCCESS] Optimized structure saved for: ${slug}`);
      return { file: fileName, slug, roadmap: optimizedRoadmap, skipPhase2: false };
    } catch (error) {
      console.error(`[Worker ${workerId}][PHASE 1 ERROR] Attempt ${attempt} failed for ${slug}:`, error.message);
      if (attempt < maxRetries) {
        await sleep(attempt * 10000);
      }
    }
  }

  console.error(`[Worker ${workerId}][PHASE 1 FAILED] Could not restructure ${slug} after ${maxRetries} attempts.`);
  return null;
}

// Main logic for Phase 2: Sourcing Resources & Generating precise English Study Guides
async function processPhase2(item, apiKey, workerId) {
  const { file, slug, roadmap } = item;
  const roadmapPath = path.join(ROADMAPS_DIR, file);
  const roadmapDocsDir = path.join(DOCS_DIR, slug);

  if (!fs.existsSync(roadmapDocsDir)) {
    fs.mkdirSync(roadmapDocsDir, { recursive: true });
  }

  // Get all topics
  const topics = getTopicsList(roadmap);
  console.log(`[Worker ${workerId}][PHASE 2 START] Sourcing docs and videos for ${slug} (${topics.length} topics)`);

  let modified = false;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const docPath = path.join(roadmapDocsDir, `${topic.id}.md`);
    
    // Check if doc exists and resource exists in JSON
    const hasDocResource = Array.isArray(topic.resources) && topic.resources.some(r => r.type === 'doc');
    const docFileExists = fs.existsSync(docPath);

    if (docFileExists) {
      if (!hasDocResource) {
        topic.resources = [
          ...(Array.isArray(topic.resources) ? topic.resources.filter(r => r.type !== 'doc') : []),
          {
            title: 'Study Guide & Notes',
            url: `/data/docs/${slug}/${topic.id}.md`,
            type: 'doc'
          }
        ];
        modified = true;
      }
      continue;
    }

    console.log(`  [Worker ${workerId}] Processing topic: "${topic.name}" (${topic.id}) [${i+1}/${topics.length}]`);

    const existingResources = Array.isArray(topic.resources) ? topic.resources : [];
    const prompt = `You are an expert technical writer and educator for SkillBun.
Your task is to evaluate the existing resources for the following topic inside the "${roadmap.title}" roadmap:

Topic Name: ${topic.name}
Topic Description: ${topic.description}

Existing Resources list:
${JSON.stringify(existingResources, null, 2)}

You must return a JSON object with three fields:
1. "needsLocalGuide": Boolean. Set to true if the existing resources list does not contain any highly specific, high-quality, and official external documentation/article links (like official developers docs, standard guides, MDN Web Docs, W3C specifications) that already make a custom local study guide redundant. Set to false if there is already a great specific external documentation/article link so that we do not generate duplicate content.
2. "documentation": String. If "needsLocalGuide" is true, write a precise, highly informative, and structured Study Guide in clean, engaging English using proper Markdown formatting. If "needsLocalGuide" is false, return an empty string.
3. "youtubeResources": Array of objects. Evaluate the existing YouTube video resources. If they are irrelevant, bad, or missing, replace them with 1 to 2 highly relevant, popular, and high-quality YouTube tutorial videos (specifically from channels like freeCodeCamp, Traversy Media, Net Ninja, CodeWithHarry, Apna College, Chai aur Code, etc.). Provide the exact 'title', 'url' (direct YouTube watch URL), and set 'type' to "video". Ensure the URLs are valid and the video is directly relevant.

Format your response strictly using the provided JSON schema.`;

    const maxRetries = 6;
    let success = false;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await callGemini(apiKey, prompt, phase2Schema);
        
        const nonVideoDocResources = Array.isArray(topic.resources)
          ? topic.resources.filter(r => r.type !== 'video' && r.type !== 'doc')
          : [];

        if (result.needsLocalGuide && result.documentation) {
          // 1. Write the markdown file
          fs.writeFileSync(docPath, result.documentation, 'utf8');

          // 2. Update the topic resources in memory
          topic.resources = [
            ...nonVideoDocResources,
            ...result.youtubeResources,
            {
              title: 'Study Guide & Notes',
              url: `/data/docs/${slug}/${topic.id}.md`,
              type: 'doc'
            }
          ];
        } else {
          // Just update the YouTube resources and keep existing non-video resources
          topic.resources = [
            ...nonVideoDocResources,
            ...result.youtubeResources
          ];
        }

        modified = true;
        success = true;
        break;
      } catch (error) {
        console.error(`  [Worker ${workerId}][PHASE 2 ERROR] Attempt ${attempt} failed for topic ${topic.id}:`, error.message);
        if (attempt < maxRetries) {
          await sleep(attempt * 10000);
        }
      }
    }

    if (!success) {
      console.error(`  [Worker ${workerId}][PHASE 2 FAILED] Failed to enrich topic "${topic.id}" after ${maxRetries} attempts.`);
    }

    // Wait slightly to respect rate limits
    await sleep(200);
  }

  // If we modified the roadmap topics, write the updated JSON back to disk
  if (modified) {
    try {
      fs.writeFileSync(roadmapPath, JSON.stringify(roadmap, null, 2), 'utf8');
      console.log(`[Worker ${workerId}][PHASE 2 SUCCESS] Updated JSON saved for: ${slug}`);
    } catch (err) {
      console.error(`[Worker ${workerId}][ERROR] Failed to save updated JSON for ${slug}:`, err.message);
    }
  } else {
    console.log(`[Worker ${workerId}][PHASE 2 SUCCESS] No changes needed or resources already updated for: ${slug}`);
  }
}

// Sourcing pipeline variables
let phase1Queue = [];
let phase2Queue = [];
let activePhase1Workers = 0;

// Mutex-like index trackers
let p1Index = 0;
let p2Index = 0;

async function phase1Loop(apiKey, workerId) {
  while (true) {
    let file = null;
    if (p1Index < phase1Queue.length) {
      file = phase1Queue[p1Index++];
    }

    if (!file) {
      break;
    }

    const result = await processPhase1(file, apiKey, workerId);
    if (result) {
      if (result.skipPhase2) {
        // Already fully enriched, no need to put in phase 2 queue
        continue;
      }
      phase2Queue.push(result);
    }
  }

  // This worker is finished with Phase 1. Decrement active counter.
  activePhase1Workers--;
  console.log(`[Worker ${workerId}] Phase 1 complete. Helping with Phase 2...`);
  
  // Transition to Phase 2 loop
  await phase2Loop(apiKey, workerId);
}

async function phase2Loop(apiKey, workerId) {
  while (true) {
    let item = null;
    if (p2Index < phase2Queue.length) {
      item = phase2Queue[p2Index++];
    }

    if (!item) {
      // If there are still active Phase 1 workers, more items might be added to phase2Queue
      if (activePhase1Workers > 0) {
        await sleep(1000);
        continue;
      } else {
        // No more items, and Phase 1 is fully finished. Exit.
        break;
      }
    }

    await processPhase2(item, apiKey, workerId);
  }
  console.log(`[Worker ${workerId}] Terminated. No more work remaining.`);
}

async function main() {
  console.log('SkillBun Roadmap Study Guide & YouTube Resource Enricher started.');
  
  try {
    const allFiles = fs.readdirSync(ROADMAPS_DIR).filter((file) => file.endsWith('.json'));
    
    // Parse arguments
    let filesToProcess = [...allFiles];
    const fileArgIndex = process.argv.indexOf('--file');
    if (fileArgIndex !== -1 && process.argv[fileArgIndex + 1]) {
      const targetFile = process.argv[fileArgIndex + 1];
      if (filesToProcess.includes(targetFile)) {
        filesToProcess = [targetFile];
        console.log(`Testing enricher on single file: ${targetFile}`);
      } else {
        console.error(`Error: File ${targetFile} not found in roadmaps directory.`);
        process.exit(1);
      }
    }

    const limitArgIndex = process.argv.indexOf('--limit');
    if (limitArgIndex !== -1 && process.argv[limitArgIndex + 1]) {
      const limit = parseInt(process.argv[limitArgIndex + 1], 10);
      if (!isNaN(limit)) {
        filesToProcess = filesToProcess.slice(0, limit);
        console.log(`Limited execution to first ${limit} files.`);
      }
    }

    phase1Queue = filesToProcess;
    console.log(`Found ${phase1Queue.length} roadmaps to process.`);

    // Initialize pipeline
    // Workers 1 to 4 do Phase 1 first, then help with Phase 2.
    // Remaining workers (worker 5 onwards) start on Phase 2 immediately.
    const numWorkers = apiKeys.length;
    activePhase1Workers = Math.min(4, numWorkers);

    const workers = [];

    // Spawn workers 1 to 4 (Phase 1 first)
    for (let i = 0; i < Math.min(4, numWorkers); i++) {
      workers.push(phase1Loop(apiKeys[i], i + 1));
    }

    // Spawn remaining workers starting from worker 5 (starts on Phase 2 immediately)
    for (let i = 4; i < numWorkers; i++) {
      workers.push(phase2Loop(apiKeys[i], i + 1));
    }

    await Promise.all(workers);
    console.log('Roadmap enrichment process completed successfully.');
  } catch (error) {
    console.error('Fatal execution error:', error.message);
  }
}

main();
