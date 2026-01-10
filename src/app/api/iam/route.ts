import { NextRequest, NextResponse } from 'next/server';
import { queryIAMUsers } from '@/lib/aws-config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      accountId: searchParams.get('accountId') || undefined,
      region: searchParams.get('region') || undefined,
      userName: searchParams.get('userName') || undefined,
    };

    const users = await queryIAMUsers(params);

    return NextResponse.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error querying IAM users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
