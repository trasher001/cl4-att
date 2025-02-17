import React, { useState, useEffect } from 'react';
import { Calculator, Copy, Plus, Trash2, RefreshCw, Sun, Moon } from 'lucide-react';

interface Bet {
  odds: number;
  stake: number;
}

interface LimitationBet {
  odds: number;
  stake: number;
  isEditing: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState<'dutching' | 'limitation'>('dutching');
  const [totalStake, setTotalStake] = useState<number>(100);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [bets, setBets] = useState<Bet[]>([
    { odds: 0, stake: 0 },
    { odds: 0, stake: 0 },
  ]);
  const [limitationBets, setLimitationBets] = useState<LimitationBet[]>([
    { odds: 0, stake: 0, isEditing: true },
    { odds: 0, stake: 0, isEditing: false },
  ]);

  const calculateDutching = () => {
    const validBets = bets.filter(bet => bet.odds > 0);
    if (validBets.length === 0) return;

    let sumInverse = validBets.reduce((sum, bet) => sum + (1 / bet.odds), 0);
    
    const newBets = bets.map(bet => {
      if (bet.odds <= 0) return { ...bet, stake: 0 };
      
      const preciseStake = totalStake / (bet.odds * sumInverse);
      const roundedStake = Math.round(preciseStake * 100) / 100;
      
      return {
        ...bet,
        stake: roundedStake
      };
    });

    const totalCalculatedStake = newBets.reduce((sum, bet) => sum + bet.stake, 0);
    const difference = totalStake - totalCalculatedStake;
    
    if (difference !== 0) {
      const lastValidBetIndex = newBets.map(bet => bet.odds > 0).lastIndexOf(true);
      if (lastValidBetIndex >= 0) {
        newBets[lastValidBetIndex].stake = +(newBets[lastValidBetIndex].stake + difference).toFixed(2);
      }
    }

    setBets(newBets);
  };

  const calculateLimitation = () => {
    const [bet1, bet2] = limitationBets;
    if (!bet1.odds || !bet2.odds) return;

    if (bet1.isEditing && bet1.stake > 0) {
      // Calculamos o retorno desejado baseado na primeira aposta
      const targetReturn = bet1.odds * bet1.stake;
      // Calculamos o stake necessário na segunda aposta para igualar o retorno
      const bet2Stake = +(targetReturn / bet2.odds).toFixed(2);
      
      setLimitationBets([
        bet1,
        { ...bet2, stake: bet2Stake, isEditing: false }
      ]);
    } else if (bet2.isEditing && bet2.stake > 0) {
      // Calculamos o retorno desejado baseado na segunda aposta
      const targetReturn = bet2.odds * bet2.stake;
      // Calculamos o stake necessário na primeira aposta para igualar o retorno
      const bet1Stake = +(targetReturn / bet1.odds).toFixed(2);
      
      setLimitationBets([
        { ...bet1, stake: bet1Stake, isEditing: false },
        bet2
      ]);
    }
  };

  useEffect(() => {
    if (activeTab === 'dutching') {
      calculateDutching();
    } else {
      calculateLimitation();
    }
  }, [totalStake, bets.map(bet => bet.odds).join(','), limitationBets.map(bet => `${bet.odds},${bet.stake},${bet.isEditing}`).join(','), activeTab]);

  const formatOddsInput = (input: string): string => {
    const numbers = input.replace(/[^\d]/g, '');
    
    if (numbers.length <= 2) return numbers;
    
    return numbers.slice(0, -2) + '.' + numbers.slice(-2);
  };

  const updateBet = (index: number, inputValue: string) => {
    const formattedValue = formatOddsInput(inputValue);
    const numericValue = parseFloat(formattedValue) || 0;
    
    const newBets = [...bets];
    newBets[index] = { ...newBets[index], odds: numericValue };
    setBets(newBets);
  };

  const updateLimitationBet = (index: number, field: 'odds' | 'stake', value: string) => {
    if (field === 'odds') {
      const formattedValue = formatOddsInput(value);
      const numericValue = parseFloat(formattedValue) || 0;
      
      const newBets = [...limitationBets];
      newBets.forEach(bet => bet.isEditing = false);
      newBets[index] = {
        ...newBets[index],
        odds: numericValue,
        isEditing: true
      };
      setLimitationBets(newBets);
    } else {
      const numericValue = parseFloat(value) || 0;
      const newBets = [...limitationBets];
      newBets.forEach(bet => bet.isEditing = false);
      newBets[index] = {
        ...newBets[index],
        stake: numericValue,
        isEditing: true
      };
      setLimitationBets(newBets);
    }
  };

  const addNewBet = () => {
    if (activeTab === 'dutching') {
      setBets([...bets, { odds: 0, stake: 0 }]);
    }
  };

  const removeBet = (index: number) => {
    if (bets.length <= 2) return;
    const newBets = bets.filter((_, i) => i !== index);
    setBets(newBets);
  };

  const copyToClipboard = (value: number) => {
    navigator.clipboard.writeText(value.toFixed(2));
  };

  const resetCalculator = () => {
    if (activeTab === 'dutching') {
      setBets([
        { odds: 0, stake: 0 },
        { odds: 0, stake: 0 },
      ]);
      setTotalStake(0);
    } else {
      setLimitationBets([
        { odds: 0, stake: 0, isEditing: true },
        { odds: 0, stake: 0, isEditing: false },
      ]);
    }
  };

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTotalStake(0);
    } else {
      setTotalStake(Number(value));
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const calculateTotalStakeForLimitation = () => {
    return limitationBets.reduce((sum, bet) => sum + bet.stake, 0);
  };

  const returns = activeTab === 'dutching'
    ? bets.filter(bet => bet.odds > 0 && bet.stake > 0).map(bet => +(bet.odds * bet.stake).toFixed(2))
    : limitationBets.filter(bet => bet.odds > 0 && bet.stake > 0).map(bet => +(bet.odds * bet.stake).toFixed(2));
  
  const totalReturn = returns.length > 0 ? returns[0] : 0;
  const currentTotalStake = activeTab === 'dutching' ? totalStake : calculateTotalStakeForLimitation();
  const profit = +(totalReturn - currentTotalStake).toFixed(2);

  return (
    <div className={`min-h-screen p-3 sm:p-8 ${isDarkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'}`}>
      {/* Banner do WhatsApp */}
      <div className="max-w-xl sm:max-w-4xl mx-auto mb-4 sm:mb-6">
        <a 
          href="https://chat.whatsapp.com/BeHEec7GcYZCx3qz883xRt" 
          target="_blank"
          rel="noopener noreferrer"
          className={`block rounded-xl shadow-2xl p-3 sm:p-4 transition-colors ${isDarkMode ? 'bg-gray-900 text-gray-100 hover:bg-gray-800' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <img 
              src="https://i.postimg.cc/gJkgD77r/whatsapp.png" 
              alt="WhatsApp" 
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <span className="text-sm sm:text-lg font-medium">Grupo de entradas free - Surebet</span>
          </div>
        </a>
      </div>

      <div className={`max-w-xl sm:max-w-4xl mx-auto rounded-xl shadow-2xl p-4 sm:p-8 text-sm sm:text-base ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Calculator className="w-6 h-6 sm:w-10 sm:h-10 text-blue-500" />
          <h1 className="text-xl sm:text-3xl font-bold">Calculadora de Dutching</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('dutching')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'dutching'
                ? isDarkMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-600 text-white'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Dutching
          </button>
          <button
            onClick={() => setActiveTab('limitation')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'limitation'
                ? isDarkMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-600 text-white'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Limitação
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          <div>
            <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
              {activeTab === 'dutching' ? 'Investimento (R$)' : 'Investimento Total (R$)'}
            </label>
            <input
              type="number"
              value={activeTab === 'dutching' ? (totalStake || '') : calculateTotalStakeForLimitation()}
              onChange={handleStakeChange}
              disabled={activeTab === 'limitation'}
              className={`w-full px-2 sm:px-4 py-1.5 sm:py-3 text-base sm:text-xl border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-black border-gray-800 text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${activeTab === 'limitation' ? 'opacity-75 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-1 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-base font-medium">Lucro:</span>
              <span className={`text-base sm:text-xl font-semibold ${profit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                R$ {profit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-base font-medium">Retorno:</span>
              <span className="text-base sm:text-xl font-semibold text-blue-500">R$ {totalReturn.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-8">
          <div className={`grid grid-cols-12 gap-1 sm:gap-4 mb-2 px-2 sm:px-4 py-1.5 sm:py-3 rounded-t-lg ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
            <div className="col-span-1 text-xs sm:text-base font-medium"></div>
            <div className="col-span-3 sm:col-span-2 text-xs sm:text-base font-medium">Odds</div>
            <div className="col-span-4 text-xs sm:text-base font-medium">Investimento</div>
            <div className="col-span-3 sm:col-span-4 text-xs sm:text-base font-medium">Retorno</div>
            <div className="col-span-1"></div>
          </div>

          {activeTab === 'dutching' ? (
            bets.map((bet, index) => (
              <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-3 items-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="col-span-1 text-xs sm:text-base font-medium">{index + 1}º</div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="text"
                    value={bet.odds || ''}
                    onChange={(e) => updateBet(index, e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-black border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-1 sm:gap-3 text-xs sm:text-base">
                  <span>R$ {bet.stake.toFixed(2)}</span>
                  <button
                    onClick={() => copyToClipboard(bet.stake)}
                    className={`p-0.5 sm:p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-black' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
                  >
                    <Copy className="w-3 h-3 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="col-span-3 sm:col-span-4 text-xs sm:text-base">
                  R$ {(bet.odds * bet.stake).toFixed(2)}
                </div>
                <div className="col-span-1">
                  {bets.length > 2 && (
                    <button
                      onClick={() => removeBet(index)}
                      className={`p-0.5 sm:p-1.5 rounded transition-colors ${isDarkMode ? 'text-red-500 hover:text-red-400 hover:bg-black' : 'text-red-500 hover:text-red-600 hover:bg-gray-100'}`}
                    >
                      <Trash2 className="w-3 h-3 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            limitationBets.map((bet, index) => (
              <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-3 items-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="col-span-1 text-xs sm:text-base font-medium">{index + 1}º</div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="text"
                    value={bet.odds || ''}
                    onChange={(e) => updateLimitationBet(index, 'odds', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-black border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-1 sm:gap-3 text-xs sm:text-base">
                  <input
                    type="number"
                    value={bet.stake || ''}
                    onChange={(e) => updateLimitationBet(index, 'stake', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-black border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`}
                    placeholder="0.00"
                    step="0.01"
                  />
                  <button
                    onClick={() => copyToClipboard(bet.stake)}
                    className={`p-0.5 sm:p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-black' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
                  >
                    <Copy className="w-3 h-3 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="col-span-3 sm:col-span-4 text-xs sm:text-base">
                  R$ {(bet.odds * bet.stake).toFixed(2)}
                </div>
                <div className="col-span-1"></div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 sm:gap-4">
          {activeTab === 'dutching' && (
            <button
              onClick={addNewBet}
              className={`px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium border rounded-md transition-colors flex items-center gap-1 sm:gap-2 ${isDarkMode ? 'text-blue-400 border-blue-500 hover:bg-black' : 'text-blue-600 border-blue-600 hover:bg-blue-50'}`}
            >
              <Plus className="w-3 h-3 sm:w-5 sm:h-5" />
              Adicionar Linha
            </button>
          )}
          <button
            onClick={resetCalculator}
            className={`px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium border rounded-md transition-colors flex items-center gap-1 sm:gap-2 ${isDarkMode ? 'text-red-400 border-red-500 hover:bg-black' : 'text-red-600 border-red-600 hover:bg-red-50'}`}
          >
            <RefreshCw className="w-3 h-3 sm:w-5 sm:h-5" />
            Limpar
          </button>
          <button
            onClick={toggleTheme}
            className={`px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium border rounded-md transition-colors flex items-center gap-1 sm:gap-2 ${
              isDarkMode 
                ? 'text-yellow-400 border-yellow-500 hover:bg-black' 
                : 'text-gray-700 border-gray-700 hover:bg-gray-50'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3 h-3 sm:w-5 sm:h-5" />
                Modo Claro
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 sm:w-5 sm:h-5" />
                Modo Escuro
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
