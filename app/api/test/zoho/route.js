import { NextResponse } from 'next/server';
import { getTransporter } from '@/utils/server/zohoMailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transporter = getTransporter();
    
    // Test the connection without sending an email
    const success = await transporter.verify();
    
    return NextResponse.json({
      success: true,
      message: 'Zoho SMTP Connection Verified successfully on Vercel Edge!',
      details: success,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: `Zoho SMTP Verification Failed: ${err.message}`,
      stack: err.stack,
    }, { status: 200 }); // 200 so Vercel doesn't intercept it
  }
}
