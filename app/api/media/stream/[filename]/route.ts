import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filePath = join(process.cwd(), 'public', 'uploads', params.filename);

        if (!existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileStats = statSync(filePath);
        const fileStream = createReadStream(filePath);

        // Determinar content type basado en extensión
        let contentType = 'application/octet-stream';
        if (params.filename.endsWith('.mp4')) contentType = 'video/mp4';
        else if (params.filename.endsWith('.jpg') || params.filename.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (params.filename.endsWith('.png')) contentType = 'image/png';
        else if (params.filename.endsWith('.pdf')) contentType = 'application/pdf';

        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Content-Length', fileStats.size.toString());
        headers.set('Content-Disposition', `inline; filename="${params.filename}"`);

        return new NextResponse(fileStream as any, { headers });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}