import { ethers } from 'ethers';
async function calculateEthBlockMiningTime(endBlock: Number, chain: string) {
    // Using ethers.js to get current block
    if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
    }


    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETH_RPC_URL);

    const currentBlock = await provider.getBlockNumber();

    // Ethereum average block time is ~12 seconds
    const ETH_BLOCK_TIME = 12;

    // Validate input
    if (!Number.isInteger(Number(endBlock))) {
        throw new Error('End block must be an integer');
    }

    // Calculate remaining blocks
    const remainingBlocks = Number(endBlock) - Number(currentBlock);

    // Get current date/time
    const currentDate = new Date();

    // Calculate end date by adding the total seconds
    const totalSeconds = remainingBlocks * ETH_BLOCK_TIME;
    const endDate = new Date(currentDate.getTime() + (totalSeconds * 1000));


    if (remainingBlocks < 0) {
        return {
            isExpired: true,
            currentBlock,
            endBlock,
            remainingBlocks,
            currentDate: currentDate,
            endDate: endDate,
            message: `Proposal ended on ${endDate}`
        };
    }

    // Calculate human readable format
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return {
        isExpired: false,
        currentBlock,
        endBlock,
        remainingBlocks,
        currentDate: currentDate,
        endDate: endDate,
        estimatedTimeInSeconds: totalSeconds,
        humanReadable: {
            days,
            hours,
            minutes,
            seconds
        },
        formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
        message: `Proposal will end on ${endDate}`
    };
}
export default calculateEthBlockMiningTime;