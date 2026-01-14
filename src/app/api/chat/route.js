import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message } = body;

    const openaiRes = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        stream: true,
      },
      responseType: 'stream',
    });

    const stream = new ReadableStream({
      start(controller) {
        openaiRes.data.on('data', (chunk) => {
          const payloads = chunk
            .toString()
            .split('\n')
            .filter(line => line.trim().startsWith('data: '));

          for (const payload of payloads) {
            const data = payload.replace(/^data: /, '');
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${text}\n\n`));
              }
            } catch (err) { }
          }
        });

        openaiRes.data.on('end', () => {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        });

        openaiRes.data.on('error', (err) => {
          controller.error(err);
        });
      },
    });

    const encoder = new TextEncoder();

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
