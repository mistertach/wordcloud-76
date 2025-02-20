
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PlusCircle, List } from "lucide-react";

const Index = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load sessions.",
        variant: "destructive",
      });
    }
  };

  const responseUrl = sessionId
    ? `${window.location.origin}/respond/${sessionId}`
    : "";

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Question Sessions
          </h1>
          <p className="text-gray-600 mb-8">
            Create and manage your question sessions
          </p>

          {!showCreateForm && !showQR && (
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowCreateForm(true)}
                className="gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Create New Session
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  loadSessions();
                  setShowCreateForm(false);
                  setShowQR(false);
                }}
                className="gap-2"
              >
                <List className="w-5 h-5" />
                View Sessions
              </Button>
            </div>
          )}
        </div>

        {showCreateForm && !showQR && (
          <Card className="p-6 shadow-lg">
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

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Create Session
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {!showCreateForm && !showQR && sessions.length > 0 && (
          <Card className="p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {session.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/view/${session.id}`)}
                    >
                      View Responses
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {showQR && sessionId && (
          <Card className="p-6 text-center shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Share your question</h2>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCode value={responseUrl} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Scan this QR code or share this link:
            </p>
            <Input value={responseUrl} readOnly className="mb-4" />
            <div className="flex gap-4 justify-center">
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
              <Button
                variant="secondary"
                onClick={() => {
                  setShowQR(false);
                  setTitle("");
                  setQuestion("");
                  setSessionId(null);
                }}
              >
                Create Another
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
