"use client";

import Link from "next/link";

export default function DocPage() {
  return (
    <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 py-8 md:py-12 text-blue-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">XCan Platform – User Guide</h1>
        <p className="mb-10 text-blue-200">Your all-in-one platform for Arbitrum learning, expert sessions, and collaboration.</p>
        {/* Overview */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">What is XCan?</h2>
          <p className="text-blue-200">XCan is a comprehensive Web3 ecosystem with three integrated platforms: <b>Learning Platform</b> for interactive courses and challenges, <b>Expert Sessions & Office Hours</b> for 1:1 or group mentorship, and <b>Video Meetings</b> for conferencing – all tied together with on-chain NFT Certifications and attendance Attestations.</p>
        </section>
        {/* Getting Started */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <h3 className="font-semibold text-blue-100 mt-2">Connect Your Wallet</h3>
          <ol className="list-decimal pl-6 text-blue-200">
            <li>Click <b>Connect Wallet</b> in the top right.</li>
            <li>Pick MetaMask/Coinbase/WalletConnect or GitHub login.</li>
            <li>Sign the message (no gas fees).</li>
            <li>Your Web3 account is created automatically.</li>
          </ol>
          <blockquote className="my-2 border-l-4 border-blue-500 pl-4 text-blue-200 italic">💡 <b>Your wallet address is your identity on XCan.</b></blockquote>
          <h3 className="font-semibold text-blue-100 mt-4">Complete Your Profile</h3>
          <p className="text-blue-200">Add a display name, profile image, socials – help the community know you!</p>
        </section>
        {/* Learning Platform */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Learning Platform</h2>
          <p className="text-blue-200">Choose from <b>9 learning paths</b> – from Web3 Basics to Advanced Arbitrum and Cross-Chain. <br />Features: interactive stories, quizzes, hands-on coding challenges, certification NFTs.</p>
          <div className="my-3 p-3 bg-blue-950/70 border border-blue-700 rounded-lg text-blue-200">
            <b>Pricing:</b> All modules are <span className="text-blue-300 font-bold">$50 each</span> except <b>Project Submission</b>, which is free.
          </div>
          <div className="mt-4 mb-2 text-blue-100 font-semibold">Learning Paths & Modules:</div>
          <ul className="list-disc pl-6 text-blue-200 space-y-1">
            <li><b>Web3 Basics:</b> Story-based intro to blockchain, smart contracts, wallets, and more. <span className="text-blue-400">Earn: Web3 Basics NFT</span></li>
            <li><b>Stylus Core Concepts:</b> Learn Rust/WASM, storage, mappings, events. <span className="text-blue-400">Earn: Stylus Core NFT</span></li>
            <li><b>Stylus Foundation:</b> Build an ERC20 token with Rust (see speedrunstylus.com). <span className="text-blue-400">Earn: Stylus Foundation NFT</span></li>
            <li><b>Arbitrum Stylus (Advanced):</b> Multi-language Stylus, Rust/C/C++, 14 challenges. <span className="text-blue-400">Earn: Advanced Stylus NFT</span></li>
            <li><b>DeFi on Arbitrum:</b> DEXs, vaults, security, 46 sections w/ quizzes. <span className="text-blue-400">Earn: DeFi Master NFT</span></li>
            <li><b>Cross-Chain Development:</b> Overview of Bridge mechanics, oracles, validators. <span className="text-blue-400">Earn: Cross-Chain Expert NFT</span></li>
            <li><b>Arbitrum Orbit:</b> Deploy + manage your own L3. <span className="text-blue-400">Earn: Orbit Builder NFT</span></li>
            <li><b>Precompile Playground:</b> Code real optimizations & L2-L1 comms in-browser.</li>
            <li><b>Project Submission (Free):</b> Showcase, get feedback, build a visible portfolio.</li>
          </ul>
          <div className="mt-2">
            <b className="text-blue-100">Recommended for Beginners:</b>
            <div className="text-blue-200">Web3 Basics → Precompile Playground → Stylus Core Concepts → Stylus Foundation → Advanced modules.</div>
          </div>
          {/* How modules work */}
          <div className="mt-6">
            <h4 className="font-semibold text-blue-100">How Modules Work</h4>
            <ul className="list-disc pl-6 text-blue-200">
              <li>Story + Quiz: Learn by story; pass quizzes (80% to proceed).</li>
              <li>Coding Challenges: Code in browser, test, auto-save.</li>
              <li>Certification unlocks when all chapters completed/passed.</li>
            </ul>
          </div>
          {/* Leaderboard */}
          <div className="mt-6">
            <h4 className="font-semibold text-blue-100">Leaderboard</h4>
            <ul className="list-disc pl-6 text-blue-200">
              <li>Rank up globally by completing challenges, modules, and NFTs minted.</li>
            </ul>
          </div>
        </section>
        {/* Expert Sessions */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Expert Sessions & Office Hours</h2>
          <p className="text-blue-200">Connect with blockchain experts for guidance via bookable sessions or drop-in office hours.</p>
          <div className="font-semibold mt-1 text-blue-100">Difference:</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li><b>Expert Sessions:</b> One-time, scheduled, dedicated meetings (project advice, code review, etc)</li>
            <li><b>Office Hours:</b> Recurring, open-door Q&A—community and mentorship.</li>
          </ul>
          <div className="mt-2 text-blue-100 font-semibold">How to book:</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Browse sessions, search by topic/expert, choose, book, get link/reminder.</li>
            <li>Cancel early to free slots for others if needed.</li>
          </ul>
          <div className="mt-2 text-blue-100 font-semibold">Host your own:</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Set up your profile (bio, skills), pick schedule & duration.</li>
          </ul>
        </section>
        {/* Video Meetings */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Video Meetings</h2>
          <p className="text-blue-200">Meetings: unique links, lobby device check, grid view, screen sharing, in-meeting chat, and blockchain-based attendance attestations.</p>
          <div className="font-semibold text-blue-100">Joining:</div>
          <ol className="list-decimal pl-6 text-blue-200">
            <li>Click meeting link</li>
            <li>Lobby to test camera/mic</li>
            <li>Set display name</li>
            <li>Join when ready</li>
          </ol>
          <div className="mt-2 text-blue-100 font-semibold">Meeting Features:</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Grid/carousel video, control bar, raise hand, emojis, chat & participants sidebar.</li>
            <li><b>Attendance attestations auto-issued if you attend ≥50%.</b></li>
          </ul>
          <div className="mt-2 text-blue-100 font-semibold">Etiquette:</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Join on time and lobby-check devices.</li>
            <li>Mute when not speaking; raise hand to interrupt.</li>
            <li>Keep video on, use headphones, no disruptive behavior.</li>
          </ul>
        </section>
        {/* NFT Certifications */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">NFT Certifications</h2>
          <div className="text-blue-200">Complete a module, earn a unique NFT certificate on Arbitrum Sepolia.</div>
          <div className="mt-2 text-blue-100 font-semibold">What are NFT Certifications?</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Permanent on-chain proof (verifiable, collectible, valued by employers)</li>
          </ul>
          <div className="mt-2 text-blue-100 font-semibold">Available Certifications:</div>
          <ol className="list-decimal pl-6 text-blue-200">
            <li>First Blood – Create your account</li>
            <li>Web3 Basics – Complete Web3 Basics</li>
            <li>Stylus Foundation – Complete Stylus Foundation</li>
            <li>Stylus Core – Complete Stylus Core Concepts</li>
            <li>DeFi Master – Complete DeFi on Arbitrum</li>
            <li>Cross-Chain Expert – Complete Cross-Chain module</li>
            <li>Orbit Builder – Complete Arbitrum Orbit</li>
            <li>XCan Advocate – All modules + submit project</li>
          </ol>
          <div className="mt-2 text-blue-100 font-semibold">How to Earn & Mint:</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Finish all module chapters, pass all required quizzes, check eligibility, and mint from dashboard (gas fee applies).</li>
            <li>Download printable certificate (for LinkedIn, resume, etc.)</li>
          </ul>
          <div className="mt-2 text-blue-100 font-semibold">Session Reward NFTs:</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Watch recorded expert sessions and mint free collectible NFTs as proof of learning—no cost to mint!</li>
          </ul>
        </section>
        {/* Attestations */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Attestations</h2>
          <p className="text-blue-200">Attestations are cryptographic proof that you attended/participated—issued via Ethereum Attestation Service on Arbitrum Sepolia.</p>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Permanent, verifiable, privacy-respecting, cannot be forged</li>
            <li>Issued automatically for meetings (≥50% attendance)</li>
            <li>Share on LinkedIn, resumes, social – public on blockchain</li>
          </ul>
        </section>
        {/* Profile and Leaderboard */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Your Profile & Leaderboard</h2>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Overview: Personal info, stats, rank</li>
            <li>Challenges Tab: Completed challenges, difficulty, points, dates</li>
            <li>Modules Tab: Progress, completion %</li>
            <li>NFTs Tab: Certification gallery with links</li>
          </ul>
        </section>
        {/* Best Practices */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Best Practices</h2>
          <div className="font-semibold text-blue-100">Learning Tips:</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Start with Web3 Basics, don’t skip chapters (they build up skills).</li>
            <li>Practice with Precompile Playground to reinforce learning.</li>
            <li>Set a regular time—do a chapter a session, build real projects.</li>
            <li>Ask in office hours or expert sessions when stuck.</li>
          </ul>
          <div className="font-semibold text-blue-100 mt-2">Security & Privacy</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Never share private keys/seed phrases</li>
            <li>Only connect on official XCan domains</li>
            <li>Separate wallets for learning vs funds</li>
          </ul>
        </section>
        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">FAQ</h2>
          {/* Collapsed for brevity: display major groups/Qs with key answers */}
          <div className="font-semibold text-blue-100">Getting Started</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>ETH only needed for NFT minting and advanced challenges.</li>
            <li>Main network: Arbitrum Sepolia (testnet) for all credentials.</li>
          </ul>
          <div className="font-semibold text-blue-100 mt-2">Learning Platform</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>No coding needed for basics; quizzes are retakeable (80%+ required to pass).</li>
            <li>If stuck: use hints, reread theory, ask in sessions, or join Discord.</li>
            <li><span className="text-blue-300 font-bold">Pricing:</span> All modules are <b>$50</b> each except <b>Project Submission (free)</b>.</li>
          </ul>
          <div className="font-semibold text-blue-100 mt-2">Sessions & Meetings</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Both sessions (scheduled) and office hours (recurring) are valuable—pick by your need.</li>
            <li>Always cancel early if you can't attend, to help others.</li>
            <li>Anyone can host sessions—just complete your profile & publish your slot.</li>
          </ul>
          <div className="font-semibold text-blue-100 mt-2">NFTs & Certificates</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Earning is free — minting costs gas(testnet) .</li>
            <li>NFTs recognized by many Web3 employers.</li>
          </ul>
          <div className="font-semibold text-blue-100 mt-2">Attestations</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Attestations and NFTs are public and verifiable.</li>
            <li>Always visible by EAS UID on EAS Explorer.</li>
          </ul>
        </section>
        {/* Support & Links */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Quick Links & Support</h2>
          <div className="font-semibold text-blue-100">Platforms</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Learning Platform: <Link href="https://modules.xcan.dev/" className="underline text-blue-100" target="_blank">modules.xcan.dev</Link></li>
            <li>Expert Sessions: <Link href="https://www.xcan.dev/" className="underline text-blue-100" target="_blank">www.xcan.dev</Link></li>
          </ul>
          <div className="font-semibold text-blue-100 mt-2">Other Links</div>
          <ul className="list-disc pl-6 text-blue-200">
            <li>Your Profile: <Link href="https://modules.xcan.dev/profile" className="underline text-blue-100" target="_blank">modules.xcan.dev/profile</Link></li>
            <li>Leaderboard: <Link href="https://modules.xcan.dev/leaderboard" className="underline text-blue-100" target="_blank">modules.xcan.dev/leaderboard</Link></li>
            <li>NFT Certifications: <Link href="https://modules.xcan.dev/nft" className="underline text-blue-100" target="_blank">modules.xcan.dev/nft</Link></li>
            <li>Twitter/X: <Link href="https://x.com/xcan_arbitrum" className="underline text-blue-100" target="_blank">x.com/xcan_arbitrum</Link></li>
          </ul>
        </section>
        <div className="mt-10 text-blue-200 italic text-center">Happy learning and collaborating with XCan!</div>
      </div>
    </div>
  );
}


