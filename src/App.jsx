import React, { useState, useEffect } from 'react';
import { Calendar, ShoppingBag, DollarSign, Heart, Search, PlusCircle, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';

// Sample data
const initialMeals = [
  { id: 1, name: "Avocado Toast", type: "breakfast", ingredients: ["bread", "avocado", "salt", "pepper", "eggs"], cost: 5.50, favorite: true, image: "images/Avocado-Toast.jpg" },
  { id: 2, name: "Chicken Salad", type: "lunch", ingredients: ["chicken breast", "lettuce", "tomato", "cucumber", "olive oil"], cost: 8.75, favorite: false, image: "images/Chicken-Salad.jpg" },
  { id: 3, name: "Spaghetti Bolognese", type: "dinner", ingredients: ["spaghetti", "ground beef", "tomato sauce", "onion", "garlic"], cost: 12.30, favorite: true, image: "images/spaghetti-bolognese.jpeg" },
  { id: 4, name: "Greek Yogurt with Berries", type: "breakfast", ingredients: ["greek yogurt", "mixed berries", "honey"], cost: 4.20, favorite: false, image: "images/yogurt-berries.jpg" },
  { id: 5, name: "Tuna Sandwich", type: "lunch", ingredients: ["bread", "tuna", "mayonnaise", "lettuce"], cost: 6.80, favorite: false, image: "images/tuna-sandwich.jpg" },
  { id: 6, name: "Vegetable Stir Fry", type: "dinner", ingredients: ["rice", "broccoli", "carrot", "bell pepper", "soy sauce"], cost: 9.50, favorite: true, image: "images/Vegetable-Stir-Fry.jpg" }
];

const initialPantryItems = ["bread", "eggs", "rice", "pasta", "olive oil", "salt", "pepper", "garlic"];

const expenseHistory = [
  { week: 1, amount: 85 },
  { week: 2, amount: 92 },
  { week: 3, amount: 78 },
  { week: 4, amount: 105 },
  { week: 5, amount: 88 },
  { week: 6, amount: 95 },
  { week: 7, amount: 82 },
  { week: 8, amount: 90 }
];

export default function MealPlannerApp() {
  const [activeTab, setActiveTab] = useState('planner');
  const [meals, setMeals] = useState(initialMeals);
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [budget, setBudget] = useState(400);
  const [expenses, setExpenses] = useState(0);
  const [pantryItems, setPantryItems] = useState(initialPantryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMeals, setFilteredMeals] = useState(meals);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newPantryItem, setNewPantryItem] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  // Initialize weekly plan
  useEffect(() => {
    const initialPlan = {};
    days.forEach(day => {
      initialPlan[day] = {
        breakfast: null,
        lunch: null,
        dinner: null
      };
    });
    setWeeklyPlan(initialPlan);
  }, []);

  // Update filtered meals when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = meals.filter(meal => 
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMeals(filtered);
    } else {
      setFilteredMeals(meals);
    }
  }, [searchTerm, meals]);

  // Calculate shopping list and expenses when weekly plan changes
  useEffect(() => {
    generateShoppingList();
    calculateExpenses();
  }, [weeklyPlan]);

  // Add meal to weekly plan
  const addMealToPlan = (day, mealType, meal) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: meal
      }
    }));
  };

  // Remove meal from weekly plan
  const removeMealFromPlan = (day, mealType) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null
      }
    }));
  };

  // Generate shopping list based on weekly plan
  const generateShoppingList = () => {
    const ingredients = new Set();
    
    // Add all ingredients from meals into the weekly plan
    Object.values(weeklyPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        if (meal && meal.ingredients) {
          meal.ingredients.forEach(ingredient => {
            // Only add if not in pantry
            if (!pantryItems.includes(ingredient)) {
              ingredients.add(ingredient);
            }
          });
        }
      });
    });
    
    // Convert to array of objects with checked property
    const newList = Array.from(ingredients).map(item => ({
      name: item,
      checked: false
    }));
    
    setShoppingList(newList);
  };

  // Calculate total expenses for the week
  const calculateExpenses = () => {
    let total = 0;
    
    Object.values(weeklyPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        if (meal && meal.cost) {
          total += meal.cost;
        }
      });
    });
    
    setExpenses(total);
  };

  // Toggle favorite of a meal
  const toggleFavorite = (mealId) => {
    setMeals(prev => 
      prev.map(meal => 
        meal.id === mealId ? { ...meal, favorite: !meal.favorite } : meal
      )
    );
  };

  // Toggle checked status of shopping list item
  const toggleShoppingItem = (index) => {
    setShoppingList(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Add item to pantry
  const addToPantry = () => {
    if (newPantryItem && !pantryItems.includes(newPantryItem)) {
      setPantryItems([...pantryItems, newPantryItem]);
      setNewPantryItem('');
      // Regenerate shopping list
      generateShoppingList();
    }
  };

  // Remove item from pantry
  const removeFromPantry = (item) => {
    setPantryItems(pantryItems.filter(i => i !== item));
    // Regenerate shopping list
    generateShoppingList();
  };

  // Get suggested recipes based on pantry items
  const getSuggestedRecipes = () => {
    return meals.filter(meal => 
      meal.ingredients.some(ingredient => pantryItems.includes(ingredient)) &&
      !meal.ingredients.every(ingredient => pantryItems.includes(ingredient))
    );
  };

  // Toggle day expansion in meal planner
  const toggleDayExpansion = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 flex items-center justify-between">
        <img src="/images/logo.png" alt="Meal Planner Logo" className="w-16 h-16 rounded" />
        <h1 className="text-2xl font-bold text-center flex-1">Meal Planner & Budget Tracker</h1>
        <img src="/images/logo.png" alt="Meal Planner Logo" className="w-16 h-16 rounded" />

      </header>
      
      {/* NavBar */}
      <nav className="bg-white shadow">
        <div className="flex justify-around">
          <button 
            className={`p-4 flex-1 flex flex-col items-center ${activeTab === 'planner' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('planner')}
          >
            <Calendar size={20} />
            <span className="text-sm mt-1">Planner</span>
          </button>
          <button 
            className={`p-4 flex-1 flex flex-col items-center ${activeTab === 'shopping' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('shopping')}
          >
            <ShoppingBag size={20} />
            <span className="text-sm mt-1">Shopping</span>
          </button>
          <button 
            className={`p-4 flex-1 flex flex-col items-center ${activeTab === 'budget' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('budget')}
          >
            <DollarSign size={20} />
            <span className="text-sm mt-1">Budget</span>
          </button>
          <button 
            className={`p-4 flex-1 flex flex-col items-center ${activeTab === 'recipes' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('recipes')}
          >
            <Heart size={20} />
            <span className="text-sm mt-1">Recipes</span>
          </button>
        </div>
      </nav>
      
      {/* Main */}
      <main className="flex-1 p-4">
        {/* Meal Planner Tab */}
        {activeTab === 'planner' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Weekly Meal Plan</h2>
            
            {/* Search Bar */}
            <div className="mb-4 relative">
              <div className="flex items-center bg-white border rounded-lg overflow-hidden">
                <Search size={20} className="ml-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search recipes..." 
                  className="flex-1 p-3 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Search Results */}
              {searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredMeals.length > 0 ? (
                    filteredMeals.map(meal => (
                      <div key={meal.id} className="p-3 border-b hover:bg-gray-100 flex items-center justify-between">
                        <div className="flex items-center">
                          <img src={meal.image} alt={meal.name} className="recipe-img h-10 rounded mr-3" />
                          <div>
                            <h4 className="font-medium">{meal.name}</h4>
                            <p className="text-sm text-gray-500">{meal.type}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => toggleFavorite(meal.id)} className="text-gray-400 hover:text-red-500">
                            <Heart size={16} fill={meal.favorite ? "currentColor" : "none"} color={meal.favorite ? "red" : "currentColor"} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">No recipes found</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Weekly Calendar */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {days.map((day) => (
                <div key={day} className="border-b last:border-b-0">
                  <div 
                    className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleDayExpansion(day)}
                  >
                    <h3 className="font-medium">{day}</h3>
                    {expandedDay === day ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  
                  {expandedDay === day && (
                    <div className="p-4">
                      {mealTypes.map((type) => (
                        <div key={type} className="mb-4 last:mb-0">
                          <h4 className="text-sm font-medium text-gray-500 mb-2 capitalize">{type}</h4>
                          
                          {weeklyPlan[day] && weeklyPlan[day][type] ? (
                            <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                              <div className="flex items-center">
                                <img 
                                  src={weeklyPlan[day][type].image} 
                                  alt={weeklyPlan[day][type].name} 
                                  className="w-12 h-12 rounded mr-3"
                                />
                                <div>
                                  <h5 className="font-medium">{weeklyPlan[day][type].name}</h5>
                                  <p className="text-sm text-gray-500">${weeklyPlan[day][type].cost.toFixed(2)}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => removeMealFromPlan(day, type)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="border border-dashed border-gray-300 rounded-lg p-3 flex justify-center">
                              <div className="relative inline-block">
                                <button
                                  className="flex items-center text-green-600 hover:text-green-800"
                                  onClick={() => setShowSuggestions(type + day)}
                                >
                                  <PlusCircle size={16} className="mr-2" />
                                  <span>Add {type}</span>
                                </button>
                                
                                {showSuggestions === type + day && (
                                  <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-y-auto max-h-64">
                                    <div className="p-2">
                                      <h5 className="font-medium text-gray-700 mb-2">Select a meal</h5>
                                      {meals
                                        .filter(meal => meal.type === type)
                                        .map(meal => (
                                          <div 
                                            key={meal.id}
                                            className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                                            onClick={() => {
                                              addMealToPlan(day, type, meal);
                                              setShowSuggestions(false);
                                            }}
                                          >
                                            <img src={meal.image} alt={meal.name} className="w-8 h-8 rounded mr-2" />
                                            <span>{meal.name}</span>
                                          </div>
                                        ))
                                      }
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Shopping List Tab */}
        {activeTab === 'shopping' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Shopping List</h2>
            
            <div className="bg-white rounded-lg shadow p-4">
              {shoppingList.length > 0 ? (
                <ul>
                  {shoppingList.map((item, index) => (
                    <li key={index} className="py-3 border-b last:border-b-0 flex items-center">
                      <button 
                        className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                        onClick={() => toggleShoppingItem(index)}
                      >
                        {item.checked && <Check size={14} className="text-white" />}
                      </button>
                      <span className={item.checked ? 'line-through text-gray-400' : ''}>{item.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Your shopping list is empty.</p>
                  <p className="text-sm">Add meals to your plan to generate a list.</p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium mt-6 mb-3">My Pantry</h3>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex mb-4">
                <input 
                  type="text" 
                  placeholder="Add pantry item..." 
                  className="flex-1 p-2 border rounded-l"
                  value={newPantryItem}
                  onChange={(e) => setNewPantryItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToPantry()}
                />
                <button 
                  className="bg-green-600 text-white px-4 rounded-r hover:bg-green-700"
                  onClick={addToPantry}
                >
                  <PlusCircle size={16} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {pantryItems.map((item, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <span className="mr-2">{item}</span>
                    <button 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => removeFromPantry(item)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Budget Tracker</h2>
            
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Monthly Budget</h3>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">$</span>
                  <input 
                    type="number" 
                    className="w-24 p-2 border rounded"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Current Week Expenses</span>
                  <span className="font-medium">${expenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Monthly Budget</span>
                  <span className="font-medium">${budget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining</span>
                  <span className={`font-medium ${budget - expenses > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(budget - expenses).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      {Math.min(Math.round((expenses / budget) * 100), 100)}% Used
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: `${Math.min(Math.round((expenses / budget) * 100), 100)}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${expenses > budget ? 'bg-red-500' : 'bg-green-500'}`}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Expense History Graph */}
            <h3 className="text-lg font-medium mb-3">Expense History</h3>
            <div className="bg-white rounded-lg shadow p-4 h-64 relative">
              <div className="absolute inset-0 flex items-end px-4 pb-4">
                {expenseHistory.map((week, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full max-w-8 bg-green-500 rounded-t"
                      style={{ height: `${(week.amount / 120) * 100}%` }}
                    ></div>
                    <span className="text-xs mt-1">W{week.week}</span>
                  </div>
                ))}
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute top-0 left-0 h-full flex flex-col justify-between pb-6 pt-2">
                <span className="text-xs text-gray-500">$120</span>
                <span className="text-xs text-gray-500">$90</span>
                <span className="text-xs text-gray-500">$60</span>
                <span className="text-xs text-gray-500">$30</span>
                <span className="text-xs text-gray-500">$0</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div>
            <h2 className="text-xl font-bold mb-4">My Recipes</h2>
            
            {/* Search Bar */}
            <div className="mb-4">
              <div className="flex items-center bg-white border rounded-lg overflow-hidden">
                <Search size={20} className="ml-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search recipes..." 
                  className="flex-1 p-3 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="font-medium mb-3">Favorite Recipes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meals
                  .filter(meal => meal.favorite)
                  .map(meal => (
                    <div key={meal.id} className="border rounded-lg p-3 flex">
                      <img src={meal.image} alt={meal.name} className="recipe-img h-16 rounded mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{meal.name}</h4>
                          <button 
                            className="text-red-500"
                            onClick={() => toggleFavorite(meal.id)}
                          >
                            <Heart size={16} fill="currentColor" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 capitalize">{meal.type}</p>
                        <p className="text-sm mt-1">${meal.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>
              
              {meals.filter(meal => meal.favorite).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Heart size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No favorite recipes yet.</p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium mb-3">Suggested Recipes Based on Your Pantry</h3>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getSuggestedRecipes().map(meal => (
                  <div key={meal.id} className="border rounded-lg p-3 flex">
                    <img src={meal.image} alt={meal.name} className="recipe-img h-16 rounded mr-3" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{meal.name}</h4>
                        <button 
                          className={`${meal.favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                          onClick={() => toggleFavorite(meal.id)}
                        >
                          <Heart size={16} fill={meal.favorite ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 capitalize">{meal.type}</p>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">You have {meal.ingredients.filter(ing => pantryItems.includes(ing)).length} of {meal.ingredients.length} ingredients</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {getSuggestedRecipes().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Search size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No recipe suggestions based on your pantry items.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-4 px-6 text-center text-gray-500 text-sm">
        Meal Planner & Budget Tracker © 2025
      </footer>
    </div>
  );
}