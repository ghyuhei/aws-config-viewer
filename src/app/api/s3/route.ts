import { NextRequest, NextResponse } from 'next/server';
import { queryS3Buckets } from '@/lib/aws-config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      accountId: searchParams.get('accountId') || undefined,
      region: searchParams.get('region') || undefined,
      bucketName: searchParams.get('bucketName') || undefined,
    };

    const buckets = await queryS3Buckets(params);

    return NextResponse.json({
      success: true,
      count: buckets.length,
      data: buckets,
    });
  } catch (error) {
    console.error('Error querying S3 buckets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
