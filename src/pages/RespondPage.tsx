
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RespondPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("question")
          .eq("id", sessionId)
          .single();

        if (error) throw error;
        if (data) setQuestion(data.question);
      } catch (error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [sessionId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("responses")
        .insert([{ session_id: sessionId, response_text: response }]);

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your response has been recorded.",
      });
      setResponse("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">{question}</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[150px]"
              required
            />
            <Button type="submit" className="w-full">
              Submit Response
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RespondPage;
