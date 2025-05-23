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

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWorkoutsAndRoutines = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {user?.username}!
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your workouts and routines
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Workouts Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Workouts</h2>
              
              {/* Create Workout Form */}
              <form onSubmit={handleCreateWorkout} className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Workout Name *
                    </label>
                    <input
                      type="text"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter workout name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={workoutDescription}
                      onChange={(e) => setWorkoutDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter workout description"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    {loading ? "Creating..." : "Create Workout"}
                  </button>
                </div>
              </form>

              {/* Workouts List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Your Workouts ({workouts.length})</h3>
                {workouts.length === 0 ? (
                  <p className="text-gray-500 italic">No workouts yet. Create your first workout above!</p>
                ) : (
                  workouts.map(workout => (
                    <div key={workout.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{workout.name}</h4>
                          {workout.description && (
                            <p className="text-gray-600 text-sm mt-1">{workout.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                          title="Delete workout"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Routines Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Routines</h2>
              
              {/* Create Routine Form */}
              <form onSubmit={handleCreateRoutine} className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Routine Name *
                    </label>
                    <input
                      type="text"
                      value={routineName}
                      onChange={(e) => setRoutineName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter routine name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={routineDescription}
                      onChange={(e) => setRoutineDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter routine description"
                      rows="3"
                    />
                  </div>
                  
                  {/* Workout Selection */}
                  {workouts.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Workouts for this Routine
                      </label>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                        {workouts.map(workout => (
                          <label key={workout.id} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              checked={selectedWorkouts.includes(workout.id)}
                              onChange={() => handleWorkoutSelection(workout.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{workout.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    {loading ? "Creating..." : "Create Routine"}
                  </button>
                </div>
              </form>

              {/* Routines List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Your Routines ({routines.length})</h3>
                {routines.length === 0 ? (
                  <p className="text-gray-500 italic">No routines yet. Create your first routine above!</p>
                ) : (
                  routines.map(routine => (
                    <div key={routine.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{routine.name}</h4>
                          {routine.description && (
                            <p className="text-gray-600 text-sm mt-1">{routine.description}</p>
                          )}
                          {routine.workouts && routine.workouts.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Workouts in this routine:</p>
                              <div className="flex flex-wrap gap-1">
                                {routine.workouts.map(workout => (
                                  <span 
                                    key={workout.id}
                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                  >
                                    {workout.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteRoutine(routine.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                          title="Delete routine"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* API Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">API Information</h3>
            <p className="text-blue-700 text-sm">
              This app connects to the FastAPI backend running on localhost:8000. 
              Check the API documentation at{" "}
              <a 
                href="http://localhost:8000/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                http://localhost:8000/docs
              </a>
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Home;