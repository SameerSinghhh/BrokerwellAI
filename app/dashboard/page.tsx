"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Profile {
  full_name: string;
  company_name: string;
  email: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Fetch user profile
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data);
        }
      };

      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || "User"}! 👋
          </h1>
          <p className="text-gray-600">
            {profile?.company_name && `${profile.company_name} • `}
            {user.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="text-4xl">📄</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Carriers Contacted</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="text-4xl">📧</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Time Saved</p>
                <p className="text-3xl font-bold text-gray-900">0h</p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get Started with Your First Submission
          </h2>
          <p className="text-gray-600 mb-6">
            Upload an ACORD form to begin streamlining your insurance submissions.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Your First ACORD Form
            </h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your PDF here, or click to browse
            </p>
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Choose File
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Coming soon: AI-powered ACORD parsing and multi-carrier submission
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-500">No activity yet. Upload your first ACORD to get started!</p>
          </div>
        </div>
      </div>
    </div>
  );
}




