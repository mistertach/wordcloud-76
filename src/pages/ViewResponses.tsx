
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactWordcloud from "react-wordcloud";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface Response {
  id: string;
  response_text: string;
  created_at: string;
}

const ViewResponses = () => {
  const { sessionId } = useParams();
  const [responses, setResponses] = useState<Response[]>([]);
  const [sessionTitle, setSessionTitle] = useState("");

  useEffect(() => {
    const fetchSessionData = async () => {
      const { data: sessionData } = await supabase
        .from("sessions")
        .select("title")
        .eq("id", sessionId)
        .single();

      if (sessionData) {
        setSessionTitle(sessionData.title);
      }
    };

    fetchSessionData();

    // Set up real-time subscription
    const channel = supabase
      .channel("responses-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setResponses((current) => [...current, payload.new as Response]);
        }
      )
      .subscribe();

    // Initial fetch of responses
    const fetchResponses = async () => {
      const { data } = await supabase
        .from("responses")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (data) {
        setResponses(data);
      }
    };

    fetchResponses();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const words = responses
    .flatMap((response) =>
      response.response_text
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3)
    )
    .reduce((acc: { text: string; value: number }[], word) => {
      const existing = acc.find((w) => w.text === word);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ text: word, value: 1 });
      }
      return acc;
    }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <p className="text-sm text-gray-500 font-medium">
            Powered by Rubini Intelligence
          </p>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {sessionTitle}
          </h1>
          <p className="text-gray-600">
            {responses.length} response{responses.length !== 1 ? "s" : ""}
          </p>
        </div>

        {words.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Word Cloud</h2>
            <div style={{ height: "400px" }}>
              <ReactWordcloud
                words={words}
                options={{
                  rotations: 0,
                  fontSizes: [20, 60],
                  fontFamily: "Inter",
                }}
              />
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Responses</h2>
          <div className="space-y-4">
            {responses.map((response) => (
              <div
                key={response.id}
                className="p-4 bg-white rounded-lg border border-gray-100"
              >
                <p className="text-gray-800">{response.response_text}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(response.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ViewResponses;
