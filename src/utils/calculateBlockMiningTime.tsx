import { ethers } from 'ethers';

/**
 * Calculates the actual mining time for past blocks or estimates future mining time
 * @param endBlock The target block number to check
 * @param chain The blockchain network (currently only supports Ethereum)
 * @returns Object containing block information, timing details, and formatted output
 */
async function calculateEthBlockMiningTime(endBlock: number, chain: string = 'ethereum') {
    // Validate input
    if (!Number.isInteger(Number(endBlock))) {
        throw new Error('End block must be an integer');
    }

    // Setup provider - try multiple methods
    let provider;
    try {
        // Try environment variable first
        if (process.env.NEXT_PUBLIC_ETH_RPC_URL) {
            provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETH_RPC_URL);
        } 
        
    } catch (error:any) {
        throw new Error(`Failed to connect to Ethereum provider: ${error.message}`);
    }

    try {
        // Get current block
        if (!provider) {
            throw new Error('Ethereum provider is not defined');
        }
        const currentBlock = await provider.getBlockNumber();
        
        // Ethereum average block time is ~12 seconds
        const ETH_BLOCK_TIME = 12;
        
        // Calculate remaining blocks
        const remainingBlocks = Number(endBlock) - Number(currentBlock);
        
        // Get current date/time
        const currentDate = new Date();
        
        let result;
        
        if (remainingBlocks < 0) {
            // Block is in the past, fetch the actual timestamp
            try {
                // Get both blocks to calculate actual time difference
                const [targetBlock, latestBlock] = await Promise.all([
                    provider.getBlock(Number(endBlock)),
                    provider.getBlock(currentBlock)
                ]);
                
                if (!targetBlock) {
                    throw new Error(`Block ${endBlock} not found`);
                }
                console.log("targetBlock",targetBlock)
                // Calculate actual mining time
                const targetBlockTime = new Date(targetBlock.timestamp * 1000);
                const formattedDate = targetBlockTime.toLocaleString();
                
                // Time since block was mined
                const timeSince = Math.floor((Date.now() - targetBlockTime.getTime()) / 1000);
                const days = Math.floor(timeSince / (24 * 60 * 60));
                const hours = Math.floor((timeSince % (24 * 60 * 60)) / (60 * 60));
                const minutes = Math.floor((timeSince % (60 * 60)) / 60);
                const seconds = timeSince % 60;
                
                result = {
                    isExpired: true,
                    currentBlock,
                    endBlock,
                    remainingBlocks,
                    currentDate: currentDate,
                    actualMiningTime: targetBlockTime,
                    TimeInEpoch: targetBlock.timestamp,
                    message: `Block ${endBlock} was mined on ${formattedDate}`,
                    timeSince: {
                        totalSeconds: timeSince,
                        days,
                        hours,
                        minutes,
                        seconds
                    },
                    formattedTimeSince: `${days}d ${hours}h ${minutes}m ${seconds}s ago`,
                };
            } catch (error) {
                // If we can't get the block, fallback to estimate
                const totalSeconds = Math.abs(remainingBlocks) * ETH_BLOCK_TIME;
                const estimatedDate = new Date(currentDate.getTime() - (totalSeconds * 1000));
                
                result = {
                    isExpired: true,
                    currentBlock,
                    endBlock,
                    remainingBlocks,
                    currentDate: currentDate,
                    estimatedMiningTime: estimatedDate,
                    message: `Block ${endBlock} was likely mined around ${estimatedDate.toLocaleString()}`,
                    note: "Using estimated time (actual block data unavailable)"
                };
            }
        } else {
            // Block is in the future
            const totalSeconds = remainingBlocks * ETH_BLOCK_TIME;
            const endDate = new Date(currentDate.getTime() + (totalSeconds * 1000));
            
            // Calculate human readable format
            const days = Math.floor(totalSeconds / (24 * 60 * 60));
            const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = Math.floor(totalSeconds % 60);
            
            result = {
                isExpired: false,
                currentBlock,
                endBlock,
                remainingBlocks,
                currentDate: currentDate,
                estimatedMiningTime: endDate,
                TimeInEpoch: endDate.getTime()/1000,
                timeRemaining: {
                    days,
                    hours,
                    minutes,
                    seconds
                },
                formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
            };
        }
        
        return result;
    } catch (error:any) {
        throw new Error(`Error calculating block time: ${error.message}`);
    }
}

export default calculateEthBlockMiningTime;