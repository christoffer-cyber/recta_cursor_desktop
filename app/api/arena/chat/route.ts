import { NextRequest, NextResponse } from 'next/server';

// Simple, robust Arena chat API
export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE ARENA CHAT START ===');
    
    const body = await request.json();
    console.log('Request body:', { 
      hasMessages: !!body.messages, 
      messagesCount: body.messages?.length || 0,
      currentCluster: body.currentCluster 
    });
    
    // Basic validation
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const { messages, currentCluster = 'pain-point', sessionId = 'default' } = body;
    const latestMessage = messages[messages.length - 1];
    
    console.log('Latest message:', { 
      role: latestMessage?.role, 
      contentLength: latestMessage?.content?.length 
    });

    // Simple confidence calculation
    const messageLength = latestMessage?.content?.length || 0;
    const confidenceIncrease = messageLength > 100 ? 25 : 15;
    const currentConfidence = Math.min(100, confidenceIncrease);

    // Simple cluster update
    const clusterUpdate = {
      clusterId: currentCluster,
      updates: {
        confidence: currentConfidence,
        status: currentConfidence >= 75 ? 'complete' : 'in-progress'
      }
    };

    // Simple AI response based on cluster
    let aiResponse = "Jag förstår att du vill förbereda en rekrytering. ";
    
    switch (currentCluster) {
      case 'pain-point':
        aiResponse += "Låt oss börja med att förstå det verkliga problemet. Kan du beskriva vilken situation ni befinner er i just nu och vad som saknas?";
        break;
      case 'impact-urgency':
        aiResponse += "Nu när vi förstår problemet, låt oss titta på påverkan. Vad händer om ni inte löser detta? Hur viktigt är det?";
        break;
      case 'success-check':
        aiResponse += "Bra! Nu behöver vi definiera vad framgång betyder. Vilka konkreta mål ska den nya personen uppnå?";
        break;
      case 'resources':
        aiResponse += "Utmärkt! Nu ska vi titta på resurser. Vad har ni för budget och kapacitet för denna rekrytering?";
        break;
      case 'org-reality':
        aiResponse += "Perfekt! Nu behöver vi förstå er organisation. Vilken typ av person skulle passa bäst i er kultur?";
        break;
      case 'alternatives':
        aiResponse += "Sista steget! Har ni övervägt andra lösningar än rekrytering? Varför är anställning rätt väg?";
        break;
      default:
        aiResponse += "Låt oss fortsätta analysera er rekryteringsbehov. Berätta mer om situationen.";
    }

    const response = {
      message: aiResponse,
      sessionId,
      clusterUpdate,
      isComplete: false
    };

    console.log('Simple response created:', { 
      messageLength: aiResponse.length,
      hasClusterUpdate: !!clusterUpdate,
      currentCluster 
    });
    console.log('=== SIMPLE ARENA CHAT END ===');
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('=== SIMPLE ARENA CHAT ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}