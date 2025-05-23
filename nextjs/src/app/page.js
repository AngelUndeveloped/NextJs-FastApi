"use client";

import { useContext, useState, useEffect } from "react";
import AuthContext from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  // Check if we're on the client side and get token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchWorkoutsAndRoutines = async () => {
      try {
        setLoading(true);
        const [workoutsResponse, routinesResponse] = await Promise.all([
          axios.get("http://localhost:8000/workouts/all", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:8000/routines/", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setWorkouts(workoutsResponse.data);
        setRoutines(routinesResponse.data);
        setError("");
      } catch (error) {
        console.error("Failed to fetch data", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchWorkoutsAndRoutines();
    }
  }, [token]);

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    if (!workoutName.trim()) {
      setError("Workout name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/workouts/", {
        name: workoutName,
        description: workoutDescription
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkouts([...workouts, response.data]);
      setWorkoutName("");
      setWorkoutDescription("");
      setError("");
    } catch (error) {
      console.error("Failed to create workout", error);
      setError("Failed to create workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    if (!routineName.trim()) {
      setError("Routine name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/routines/", {
        name: routineName,
        description: routineDescription,
        workouts: selectedWorkouts
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutines([...routines, response.data]);
      setRoutineName("");
      setRoutineDescription("");
      setSelectedWorkouts([]);
      setError("");
    } catch (error) {
      console.error("Failed to create routine", error);
      setError("Failed to create routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/workouts/?workout_id=${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkouts(workouts.filter(workout => workout.id !== workoutId));
      setError("");
    } catch (error) {
      console.error("Failed to delete workout", error);
      setError("Failed to delete workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/routines/?routine_id=${routineId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutines(routines.filter(routine => routine.id !== routineId));
      setError("");
    } catch (error) {
      console.error("Failed to delete routine", error);
      setError("Failed to delete routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutSelection = (workoutId) => {
    setSelectedWorkouts(prev => 
      prev.includes(workoutId) 
        ? prev.filter(id => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="text-white">
                <h1 className="text-3xl font-bold">
                  Welcome back, {user?.username}! 👋
                </h1>
                <p className="text-blue-100 mt-1">
                  Ready to crush your fitness goals today?
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                ← Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-r-lg mb-8 shadow-sm">
              <div className="flex items-center">
                <span className="text-red-400 mr-3">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                <p className="text-gray-700 font-medium">Processing...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Workouts Section */}
            <div className="space-y-6">
              {/* Create Workout Card */}
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mr-4">
                    <span className="text-white text-xl">💪</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Create Workout</h2>
                </div>
                
                <form onSubmit={handleCreateWorkout} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Workout Name *
                    </label>
                    <input
                      type="text"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50"
                      placeholder="e.g., Morning Cardio"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={workoutDescription}
                      onChange={(e) => setWorkoutDescription(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 resize-none"
                      placeholder="Describe your workout routine..."
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    {loading ? "Creating..." : "✨ Create Workout"}
                  </button>
                </form>
              </div>

              {/* Workouts List */}
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Your Workouts</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {workouts.length} total
                  </span>
                </div>
                
                {workouts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏃‍♂️</div>
                    <p className="text-gray-500 text-lg">No workouts yet</p>
                    <p className="text-gray-400 text-sm">Create your first workout above!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {workouts.map(workout => (
                      <div key={workout.id} className="group bg-gradient-to-r from-white to-blue-50 border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{workout.name}</h4>
                            {workout.description && (
                              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{workout.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteWorkout(workout.id)}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ml-3"
                            title="Delete workout"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Routines Section */}
            <div className="space-y-6">
              {/* Create Routine Card */}
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl mr-4">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Create Routine</h2>
                </div>
                
                <form onSubmit={handleCreateRoutine} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Routine Name *
                    </label>
                    <input
                      type="text"
                      value={routineName}
                      onChange={(e) => setRoutineName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 bg-white/50"
                      placeholder="e.g., Weekly Training Plan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={routineDescription}
                      onChange={(e) => setRoutineDescription(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 bg-white/50 resize-none"
                      placeholder="Describe your routine..."
                      rows="3"
                    />
                  </div>
                  
                  {/* Workout Selection */}
                  {workouts.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Workouts
                      </label>
                      <div className="max-h-40 overflow-y-auto bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                        {workouts.map(workout => (
                          <label key={workout.id} className="flex items-center space-x-3 py-2 hover:bg-white rounded-lg px-2 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedWorkouts.includes(workout.id)}
                              onChange={() => handleWorkoutSelection(workout.id)}
                              className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                            />
                            <span className="text-gray-700 font-medium">{workout.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    {loading ? "Creating..." : "🎯 Create Routine"}
                  </button>
                </form>
              </div>

              {/* Routines List */}
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Your Routines</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {routines.length} total
                  </span>
                </div>
                
                {routines.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-gray-500 text-lg">No routines yet</p>
                    <p className="text-gray-400 text-sm">Create your first routine above!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {routines.map(routine => (
                      <div key={routine.id} className="group bg-gradient-to-r from-white to-green-50 border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-green-200 transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{routine.name}</h4>
                            {routine.description && (
                              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{routine.description}</p>
                            )}
                            {routine.workouts && routine.workouts.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-2 font-medium">Included workouts:</p>
                                <div className="flex flex-wrap gap-2">
                                  {routine.workouts.map(workout => (
                                    <span 
                                      key={workout.id}
                                      className="inline-flex items-center bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium"
                                    >
                                      💪 {workout.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ml-3"
                            title="Delete routine"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Information */}
          <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-500 p-2 rounded-lg mr-3">
                <span className="text-white">🔗</span>
              </div>
              <h3 className="font-bold text-indigo-900 text-lg">API Connection</h3>
            </div>
            <p className="text-indigo-700 leading-relaxed">
              Connected to FastAPI backend on{" "}
              <code className="bg-indigo-100 px-2 py-1 rounded font-mono text-sm">localhost:8000</code>
              {" "}• View API docs:{" "}
              <a 
                href="http://localhost:8000/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium underline transition-colors"
              >
                Interactive Documentation 🚀
              </a>
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Home;