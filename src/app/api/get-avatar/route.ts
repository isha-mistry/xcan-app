import { NextResponse } from 'next/server';
import { getEnsAvatarUrl } from "@/utils/ENSUtils";
import { IMAGE_URL } from "@/config/staticDataUtils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const delegateAddress = searchParams.get('address');
        
        if (!delegateAddress) {
            return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
        }
        
        const avatarUrl = await getEnsAvatarUrl(delegateAddress);
        
        if (avatarUrl) {
            // Do a basic validation before returning
            try {
                // Try creating a URL object to validate basic URL format
                new URL(avatarUrl);
                
                // For certain URLs, we might want to transform them
                let processedUrl = avatarUrl;
                
                // Handle complex NFT URLs
                if (avatarUrl.includes('nft/') || avatarUrl.includes('erc1155:') || avatarUrl.startsWith('eip155:')) {
                    console.log("NFT avatar URL detected, using default avatar instead");
                    return NextResponse.json({
                        avatarUrl: IMAGE_URL,
                        originalUrl: avatarUrl,
                        isNft: true
                    });
                }
                
                // Check if it's an IPFS URL from cloudflare that might be problematic
                if (avatarUrl.includes('cloudflare-ipfs.com')) {
                    // Verify if the IPFS content is actually an image by making a HEAD request
                    try {
                        const response = await fetch(avatarUrl, { method: 'HEAD' });
                        const contentType = response.headers.get('content-type');
                        
                        if (!contentType || !contentType.startsWith('image/')) {
                            console.log(`IPFS content is not an image: ${contentType}`);
                            // Try an alternative gateway
                            const ipfsHashMatch = avatarUrl.match(/\/ipfs\/([a-zA-Z0-9]+)/);
                            if (ipfsHashMatch && ipfsHashMatch[1]) {
                                processedUrl = `https://ipfs.io/ipfs/${ipfsHashMatch[1]}`;
                            } else {
                                // If we can't extract a hash, use default
                                processedUrl = IMAGE_URL;
                            }
                        }
                    } catch (fetchError) {
                        console.error("Error fetching IPFS content:", fetchError);
                        processedUrl = IMAGE_URL;
                    }
                }
                
                return NextResponse.json({ avatarUrl: processedUrl });
            } catch (urlError) {
                console.error("Invalid avatar URL format:", urlError);
                return NextResponse.json({
                    avatarUrl: IMAGE_URL,
                    error: 'Invalid avatar URL format',
                    originalUrl: avatarUrl
                });
            }
        } else {
            return NextResponse.json({ message: 'No avatar found for this address' }, { status: 404 });
        }
    } catch (error) {
        console.error("Error in GET avatar API:", error);
        return NextResponse.json({  avatarUrl: IMAGE_URL ,error: 'Internal server error' }, { status: 500 });
    }
}