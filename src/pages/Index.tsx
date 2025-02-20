
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert([{ title, question }])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setShowQR(true);
      toast({
        title: "Success!",
        description: "Your question session has been created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const responseUrl = sessionId
    ? `${window.location.origin}/respond/${sessionId}`
    : "";

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create a Question Session
          </h1>
          <p className="text-gray-600">
            Create a question and share it with your audience
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={createSession} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Team Meeting Feedback"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What are your expectations for this session?"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Create Session
            </Button>
          </form>
        </Card>

        {showQR && sessionId && (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Share your question</h2>
            <div className="flex justify-center mb-4">
              <QRCode value={responseUrl} />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Scan this QR code or share this link:
            </p>
            <Input value={responseUrl} readOnly />
            <div className="mt-4 space-x-4">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(responseUrl);
                  toast({
                    description: "Link copied to clipboard!",
                  });
                }}
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/view/${sessionId}`, "_blank")}
              >
                View Responses
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
