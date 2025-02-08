import React, { useState, useEffect } from 'react';
import { Calculator, Copy, Plus, Trash2, RefreshCw, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface Bet {
  odds: number;
  stake: number;
}

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [totalStake, setTotalStake] = useState<number>(100);
  const [bets, setBets] = useState<Bet[]>([
    { odds: 0, stake: 0 },
    { odds: 0, stake: 0 },
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

  useEffect(() => {
    calculateDutching();
  }, [totalStake, bets.map(bet => bet.odds).join(',')]);

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

  const addNewBet = () => {
    setBets([...bets, { odds: 0, stake: 0 }]);
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
    setBets([
      { odds: 0, stake: 0 },
      { odds: 0, stake: 0 },
    ]);
    setTotalStake(0);
  };

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTotalStake(0);
    } else {
      setTotalStake(Number(value));
    }
  };

  const returns = bets
    .filter(bet => bet.odds > 0 && bet.stake > 0)
    .map(bet => +(bet.odds * bet.stake).toFixed(2));
  
  const totalReturn = returns.length > 0 ? returns[0] : 0;
  const profit = +(totalReturn - totalStake).toFixed(2);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'} p-3 sm:p-8`}>
      {/* Banner do WhatsApp */}
      <div className="max-w-xl sm:max-w-4xl mx-auto mb-4 sm:mb-6">
        <a 
          href="https://chat.whatsapp.com/BeHEec7GcYZCx3qz883xRt" 
          target="_blank"
          rel="noopener noreferrer"
          className={`block ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-2xl p-3 sm:p-4 ${isDark ? 'text-gray-100' : 'text-gray-900'} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <img 
              src="https://i.postimg.cc/gJkgD77r/whatsapp.png" 
              alt="WhatsApp" 
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-sm sm:text-lg font-medium">Grupo de entradas free - Surebet</span>
          </div>
        </a>
      </div>

      <div className={`max-w-xl sm:max-w-4xl mx-auto ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-2xl p-4 sm:p-8 ${isDark ? 'text-gray-100' : 'text-gray-900'} text-sm sm:text-base`}>
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Calculator className="w-6 h-6 sm:w-10 sm:h-10 text-blue-500" />
          <h1 className="text-xl sm:text-3xl font-bold">Calculadora de Dutching</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          <div>
            <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
              Investimento (R$)
            </label>
            <input
              type="number"
              value={totalStake || ''}
              onChange={handleStakeChange}
              className={`w-full px-2 sm:px-4 py-1.5 sm:py-3 text-base sm:text-xl ${isDark ? 'bg-black' : 'bg-gray-50'} border ${isDark ? 'border-gray-800' : 'border-gray-200'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
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
          <div className={`grid grid-cols-12 gap-1 sm:gap-4 mb-2 px-2 sm:px-4 py-1.5 sm:py-3 rounded-t-lg ${isDark ? 'bg-black' : 'bg-gray-200'}`}>
            <div className="col-span-1 text-xs sm:text-base font-medium"></div>
            <div className="col-span-3 sm:col-span-2 text-xs sm:text-base font-medium">Odds</div>
            <div className="col-span-4 text-xs sm:text-base font-medium">Investimento</div>
            <div className="col-span-3 sm:col-span-4 text-xs sm:text-base font-medium">Retorno</div>
            <div className="col-span-1"></div>
          </div>

          {bets.map((bet, index) => (
            <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-3 items-center border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="col-span-1 text-xs sm:text-base font-medium">{index + 1}º</div>
              <div className="col-span-3 sm:col-span-2">
                <input
                  type="text"
                  value={bet.odds || ''}
                  onChange={(e) => updateBet(index, e.target.value)}
                  className={`w-full px-2 sm:px-3 py-1 sm:py-2 ${isDark ? 'bg-black' : 'bg-gray-50'} border ${isDark ? 'border-gray-800' : 'border-gray-200'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'text-gray-100' : 'text-gray-900'} text-sm sm:text-lg`}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-4 flex items-center gap-1 sm:gap-3 text-xs sm:text-base">
                <span>R$ {bet.stake.toFixed(2)}</span>
                <button
                  onClick={() => copyToClipboard(bet.stake)}
                  className={`p-0.5 sm:p-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'} hover:text-blue-400 ${isDark ? 'hover:bg-black' : 'hover:bg-gray-100'} rounded transition-colors`}
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
                    className={`p-0.5 sm:p-1.5 text-red-500 hover:text-red-400 ${isDark ? 'hover:bg-black' : 'hover:bg-gray-100'} rounded transition-colors`}
                  >
                    <Trash2 className="w-3 h-3 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={addNewBet}
            className={`px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium text-blue-400 border border-blue-500 rounded-md ${isDark ? 'hover:bg-black' : 'hover:bg-gray-100'} transition-colors flex items-center gap-1 sm:gap-2`}
          >
            <Plus className="w-3 h-3 sm:w-5 sm:h-5" />
            Adicionar Linha
          </button>
          <button
            onClick={resetCalculator}
            className={`px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium text-red-400 border border-red-500 rounded-md ${isDark ? 'hover:bg-black' : 'hover:bg-gray-100'} transition-colors flex items-center gap-1 sm:gap-2`}
          >
            <RefreshCw className="w-3 h-3 sm:w-5 sm:h-5" />
            Limpar
          </button>
          <button
            onClick={toggleTheme}
            className={`px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-base font-medium ${isDark ? 'text-yellow-400 border-yellow-500' : 'text-black-400 border-black-500'} border rounded-md ${isDark ? 'hover:bg-black' : 'hover:bg-gray-100'} transition-colors flex items-center gap-1 sm:gap-2`}
          >
            {isDark ? <Sun className="w-3 h-3 sm:w-5 sm:h-5" /> : <Moon className="w-3 h-3 sm:w-5 sm:h-5" />}
            {isDark ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
