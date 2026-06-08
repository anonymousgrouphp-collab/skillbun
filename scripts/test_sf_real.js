const fs = require('fs');
const path = require('path');

const apiKey = 'sk-ptdlaqeyarjcbloheifxqqvfppvqymtkirvmreqbpozmgwlq';
const roadmapPath = 'public/data/roadmaps/dotnet_developer.json';

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

async function runTest() {
  console.log('Reading dotnet_developer.json...');
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));

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
4. Keep the existing format (tree). Do not change the format type of the file.
5. In your response, preserve all properties of the roadmap, returning the fully optimized schema matching the input format. Do not modify the roadmap ID.`;

  const schema = treeSchema;
  const promptWithSchema = `${prompt}\n\nIMPORTANT: You must return your response as a valid JSON object strictly matching this JSON Schema:\n${JSON.stringify(schema, null, 2)}`;

  console.log('Sending request to DeepSeek-V3...');
  const start = Date.now();
  try {
    const response = await fetch('https://api.siliconflow.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          { role: 'user', content: promptWithSchema }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 4096
      })
    });

    console.log(`Status Code: ${response.status}`);
    const data = await response.json();
    console.log(`Duration: ${((Date.now() - start) / 1000).toFixed(2)}s`);
    
    if (response.ok) {
      const text = data.choices[0].message.content;
      console.log(`Output text length: ${text.length}`);
      console.log('Parsed JSON output successfully!');
    } else {
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

runTest();
