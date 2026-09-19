import { NextRequest, NextResponse } from 'next/server';

// Gemini API 未設定時のフォールバック整形関数
function fallbackFormat(rawText: string, staffName: string, siteName: string): string {
  const lines = rawText.split(/[、。\n]/).filter((l) => l.trim().length > 0);

  return `【作業日報】
■ 報告者: ${staffName}
■ 担当現場: ${siteName || '各担当現場'}
■ 施工実績・作業進捗:
${lines.slice(0, 3).map((l) => `・${l.trim()}`).join('\n')}

■ 安全・環境・養生状況:
・作業環境の整理整頓、工具点検および安全確認を実施済み。

■ 明日の予定・連絡手配事項:
${lines.length > 3 ? lines.slice(3).map((l) => `・${l.trim()}`).join('\n') : '・特段の変更なし。通常工程通り進捗予定。'}`;
}

export async function POST(req: NextRequest) {
  try {
    const { rawText, staffName, siteName } = await req.json();

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json(
        { error: 'テキストが入力されていません' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Gemini API が設定されている場合
    if (apiKey && !apiKey.includes('your-api-key')) {
      try {
        const prompt = `あなたは建設会社・現場管理の専門アシスタントです。
現場職人がスマートフォンで音声入力（または粗削りにメモ）した以下のテキストを、建設会社向けのプロフェッショナルで整理された業務日報に校正・整形してください。

【制約事項】
・無駄な前置きや挨拶は一切含めず、日報テキストのみを出力してください。
・以下の見出し構成で分かりやすく箇条書きにしてください。
  【作業日報】
  ■ 担当現場: （現場名）
  ■ 報告者: （報告者名）
  ■ 施工実績・作業進捗: （今日行った作業内容、数量や進捗度合い）
  ■ 安全・養生・環境配慮: （安全確認、雨天養生、整理整頓など）
  ■ 明日の予定・資材手配・連絡事項: （明日の予定や応援要請、材料不足の連絡など）
・話し言葉を、建設業の適切な用語に整えてください。

【入力情報】
報告者: ${staffName || '担当社員'}
現場名: ${siteName || '担当現場'}
職人の音声入力テキスト:
"""
${rawText}
"""`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({ formattedReport: generatedText.trim(), source: 'gemini' });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using fallback', geminiError);
      }
    }

    // APIキーがない、またはAPI呼び出しが失敗した場合はフォールバック整形
    const fallbackResult = fallbackFormat(rawText, staffName || '担当社員', siteName || '担当現場');
    return NextResponse.json({ formattedReport: fallbackResult, source: 'fallback' });
  } catch (error) {
    console.error('Report format error', error);
    return NextResponse.json(
      { error: '日報の生成に失敗しました' },
      { status: 500 }
    );
  }
}
