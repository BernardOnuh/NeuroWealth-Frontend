'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I connect my wallet to NeuroWealth?',
    answer: 'To connect your wallet, click the "Connect Wallet" button in the top navigation bar. Select your preferred wallet (Freighter, Albedo, or other Stellar wallets), approve the connection request, and your wallet will be connected to the platform.',
    category: 'Getting Started'
  },
  {
    id: '2',
    question: 'What is NeuroWealth and how does it work?',
    answer: 'NeuroWealth is a decentralized finance platform built on the Stellar network that allows you to manage digital assets, participate in staking, and access various DeFi services. It uses blockchain technology to ensure transparency and security.',
    category: 'Getting Started'
  },
  {
    id: '3',
    question: 'Is my wallet secure on NeuroWealth?',
    answer: 'Yes, NeuroWealth prioritizes security. We never store your private keys or sensitive wallet information. All transactions require your explicit approval through your connected wallet. We use industry-standard encryption and security practices.',
    category: 'Security'
  },
  {
    id: '4',
    question: 'What should I do if I forget my password?',
    answer: 'NeuroWealth doesn\'t store passwords - we rely on your wallet\'s security. If you forget your wallet password or seed phrase, you\'ll need to use your wallet\'s recovery process. Always keep your seed phrase secure and backed up.',
    category: 'Security'
  },
  {
    id: '5',
    question: 'Why is my transaction taking so long to confirm?',
    answer: 'Transaction times can vary based on network congestion and gas fees. Stellar transactions typically confirm within 3-5 seconds. If your transaction is pending, check the network status and ensure you\'ve paid sufficient fees.',
    category: 'Transactions'
  },
  {
    id: '6',
    question: 'What are gas fees and how are they calculated?',
    answer: 'Gas fees are small amounts of XLM paid to network validators for processing transactions. On Stellar, fees are minimal (currently 0.00001 XLM per operation) and predictable. The total fee depends on the number of operations in your transaction.',
    category: 'Transactions'
  },
  {
    id: '7',
    question: 'How do I check my transaction status?',
    answer: 'You can check transaction status by using a Stellar block explorer like Stellar.expert or by checking your transaction history in your wallet. Enter the transaction ID to view details including confirmation status and network confirmations.',
    category: 'Transactions'
  },
  {
    id: '8',
    question: 'What tokens are supported on NeuroWealth?',
    answer: 'NeuroWealth supports all Stellar-based tokens including XLM, USDC, EURT, and other custom tokens. You can view supported tokens in the assets section of your dashboard.',
    category: 'Assets'
  },
  {
    id: '9',
    question: 'How do I add a custom token to my wallet?',
    answer: 'To add a custom token, go to the Assets section, click "Add Token," and enter the token\'s contract address. The system will verify the token and add it to your portfolio if it\'s valid.',
    category: 'Assets'
  },
  {
    id: '10',
    question: 'What is staking and how do I participate?',
    answer: 'Staking allows you to earn rewards by locking your tokens to support network operations. Navigate to the Staking section, select the amount you want to stake, choose a validator, and confirm the transaction. Rewards are distributed automatically.',
    category: 'Staking'
  },
  {
    id: '11',
    question: 'When do I receive staking rewards?',
    answer: 'Staking rewards are typically distributed every 24-48 hours, depending on the validator and network conditions. You can view your pending and earned rewards in the Staking section of your dashboard.',
    category: 'Staking'
  },
  {
    id: '12',
    question: 'How can I contact customer support?',
    answer: 'You can reach our support team through the Contact Support form on this help page, email us at support@neurowealth.com, or join our Discord community for real-time assistance from our team and community members.',
    category: 'Support'
  }
];

const categories = ['All', 'Getting Started', 'Security', 'Transactions', 'Assets', 'Staking', 'Support'];

export default function FAQSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch = searchTerm === '' || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpanded(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <div className="space-y-4">
          <div>
            <label htmlFor="faq-search" className="block text-sm font-medium text-slate-300 mb-2">
              Search FAQs
            </label>
            <input
              id="faq-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type your question or keywords..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              aria-label="Search frequently asked questions"
            />
          </div>
          
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-slate-300 mb-2">
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              aria-label="Filter FAQs by category"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-dark-800">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-slate-400">
        Found {filteredFAQs.length} {filteredFAQs.length === 1 ? 'FAQ' : 'FAQs'}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-slate-400">No FAQs found matching your search criteria.</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your search terms or category filter.</p>
            </div>
          </Card>
        ) : (
          filteredFAQs.map((faq: FAQItem) => (
            <Card key={faq.id} className="overflow-hidden">
              <button
                onClick={() => toggleExpanded(faq.id)}
                onKeyDown={(e) => handleKeyDown(e, faq.id)}
                className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset rounded-xl transition-all duration-200 hover:bg-white/5"
                aria-expanded={expandedItems.has(faq.id)}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                        expandedItems.has(faq.id) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              <div
                id={`faq-answer-${faq.id}`}
                className={`overflow-hidden transition-all duration-300 ${
                  expandedItems.has(faq.id) ? 'max-h-96' : 'max-h-0'
                }`}
                aria-hidden={!expandedItems.has(faq.id)}
              >
                <div className="px-6 pb-6 pt-0">
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
