"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { fetchData, sendData } from "@/lib/api";
import {
  MessageCircle,
  Send,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function CommunicationCenter() {
  const [loading, setLoading] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [clients, setClients] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [selectedTab, setSelectedTab] = useState("reminders");
  const [formData, setFormData] = useState({
    selectedClients: [],
    tone: "friendly",
    language: "english",
    customMessage: "",
    generatedMessage: "",
    messageType: "reminder",
  });

  // Fetch clients and message history on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch clients
      const clientsResponse = await fetchData("app/allClient?limit=100");
      if (clientsResponse.status_code === 200) {
        setClients(clientsResponse.data || []);
      }

      // Fetch message history
      const historyResponse = await fetchData("app/communication/history");
      if (historyResponse.status_code === 200) {
        setMessageHistory(historyResponse.data || []);
      }
    } catch (error) {
      toast.error("Failed to load initial data");
    }
  };

  const generateAIMessage = async () => {
    if (formData.selectedClients.length === 0) {
      toast.error("Please select at least one client");
      return;
    }

    setGeneratingMessage(true);
    try {
      // Use the integrated communication endpoint with AI
      const response = await sendData("app/communication/send", {
        clientIds: formData.selectedClients,
        message: "", // Empty message to generate AI content
        tone: formData.tone,
        language: formData.language,
        messageType: formData.messageType,
        generateMessage: true, // Flag to generate AI message
      });

      if (response.success === true && response.aiInsights?.message) {
        setFormData((prev) => ({
          ...prev,
          generatedMessage: response.aiInsights.message,
        }));
        toast.success("AI message generated successfully");
      } else {
        // Fallback if AI generation failed
        const fallbackMessages = {
          reminder:
            "Hi! This is a friendly reminder about your upcoming payment.",
          welcome: "Welcome! We're excited to have you on board.",
          thank_you: "Thank you for your business! We appreciate you.",
          custom: "Hello! We hope this message finds you well.",
        };

        setFormData((prev) => ({
          ...prev,
          generatedMessage:
            fallbackMessages[formData.messageType] ||
            "Hello! We hope this message finds you well.",
        }));
        toast.info("Using default message (AI generation unavailable)");
      }
    } catch (error) {
      // Fallback on error
      const fallbackMessages = {
        reminder:
          "Hi! This is a friendly reminder about your upcoming payment.",
        welcome: "Welcome! We're excited to have you on board.",
        thank_you: "Thank you for your business! We appreciate you.",
        custom: "Hello! We hope this message finds you well.",
      };

      setFormData((prev) => ({
        ...prev,
        generatedMessage:
          fallbackMessages[formData.messageType] ||
          "Hello! We hope this message finds you well.",
      }));
      toast.info("Using default message due to error");
    } finally {
      setGeneratingMessage(false);
    }
  };

  const sendMessage = async () => {
    if (formData.selectedClients.length === 0) {
      toast.error("Please select at least one client");
      return;
    }

    const message = formData.generatedMessage || formData.customMessage;
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      // Use the integrated communication endpoint with AI
      const response = await sendData("app/communication/send", {
        clientIds: formData.selectedClients,
        message: message,
        tone: formData.tone,
        language: formData.language,
        messageType: formData.messageType,
      });

      if (response.success === true) {
        toast.success("Message sent successfully");

        // Show AI insights if available
        if (response.aiInsights) {
        }

        // Reset form
        setFormData((prev) => ({
          ...prev,
          selectedClients: [],
          customMessage: "",
          generatedMessage: "",
        }));
        // Refresh message history
        await fetchInitialData();
      } else {
        throw new Error(response.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleClientToggle = (clientId) => {
    setFormData((prev) => ({
      ...prev,
      selectedClients: prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter((id) => id !== clientId)
        : [...prev.selectedClients, clientId],
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Sent
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communication Center</h1>
          <p className="text-muted-foreground">
            AI-powered communication with your clients
          </p>
        </div>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reminders">Payment Reminders</TabsTrigger>
          <TabsTrigger value="welcome">Welcome Messages</TabsTrigger>
          <TabsTrigger value="custom">Custom Messages</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Selection */}
                <div className="space-y-4">
                  <Label>Select Clients</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
                    {clients.map((client) => (
                      <div
                        key={client._id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={client._id}
                          checked={formData.selectedClients.includes(
                            client._id
                          )}
                          onChange={() => handleClientToggle(client._id)}
                          className="rounded"
                        />
                        <Label
                          htmlFor={client._id}
                          className="text-sm cursor-pointer"
                        >
                          {client.name}
                          {client.mobileNumber
                            ? ` (${client.mobileNumber})`
                            : ""}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Configuration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tone</Label>
                      <Select
                        value={formData.tone}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, tone: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, language: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="gujarati">Gujarati</SelectItem>
                          <SelectItem value="marathi">Marathi</SelectItem>
                          <SelectItem value="tamil">Tamil</SelectItem>
                          <SelectItem value="telugu">Telugu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={generateAIMessage}
                    disabled={
                      generatingMessage || formData.selectedClients.length === 0
                    }
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {generatingMessage
                      ? "Generating..."
                      : "Generate AI Reminder"}
                  </Button>

                  <Textarea
                    placeholder="AI-generated reminder will appear here..."
                    value={formData.generatedMessage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        generatedMessage: e.target.value,
                      }))
                    }
                    rows={4}
                  />

                  <Button
                    onClick={sendMessage}
                    disabled={
                      loading ||
                      formData.selectedClients.length === 0 ||
                      (!formData.generatedMessage && !formData.customMessage)
                    }
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Sending..." : "Send Reminders"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="welcome" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Selection */}
                <div className="space-y-4">
                  <Label>Select New Clients</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
                    {clients
                      .filter((client) => client.isNew)
                      .map((client) => (
                        <div
                          key={client._id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={client._id}
                            checked={formData.selectedClients.includes(
                              client._id
                            )}
                            onChange={() => handleClientToggle(client._id)}
                            className="rounded"
                          />
                          <Label
                            htmlFor={client._id}
                            className="text-sm cursor-pointer"
                          >
                            {client.name} ({client.mobileNumber})
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Message Configuration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tone</Label>
                      <Select
                        value={formData.tone}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, tone: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, language: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="gujarati">Gujarati</SelectItem>
                          <SelectItem value="marathi">Marathi</SelectItem>
                          <SelectItem value="tamil">Tamil</SelectItem>
                          <SelectItem value="telugu">Telugu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={generateAIMessage}
                    disabled={
                      generatingMessage || formData.selectedClients.length === 0
                    }
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {generatingMessage
                      ? "Generating..."
                      : "Generate Welcome Message"}
                  </Button>

                  <Textarea
                    placeholder="AI-generated welcome message will appear here..."
                    value={formData.generatedMessage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        generatedMessage: e.target.value,
                      }))
                    }
                    rows={4}
                  />

                  <Button
                    onClick={sendMessage}
                    disabled={
                      loading ||
                      formData.selectedClients.length === 0 ||
                      (!formData.generatedMessage && !formData.customMessage)
                    }
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Sending..." : "Send Welcome Messages"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Selection */}
                <div className="space-y-4">
                  <Label>Select Clients</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
                    {clients.map((client) => (
                      <div
                        key={client._id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={client._id}
                          checked={formData.selectedClients.includes(
                            client._id
                          )}
                          onChange={() => handleClientToggle(client._id)}
                          className="rounded"
                        />
                        <Label
                          htmlFor={client._id}
                          className="text-sm cursor-pointer"
                        >
                          {client.name} ({client.mobileNumber})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Message */}
                <div className="space-y-4">
                  <div>
                    <Label>Custom Message</Label>
                    <Textarea
                      placeholder="Type your custom message here..."
                      value={formData.customMessage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customMessage: e.target.value,
                        }))
                      }
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={sendMessage}
                    disabled={
                      loading ||
                      formData.selectedClients.length === 0 ||
                      !formData.customMessage.trim()
                    }
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Sending..." : "Send Custom Message"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messageHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages sent yet</p>
                  </div>
                ) : (
                  messageHistory.map((message) => (
                    <div
                      key={message._id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(message.status)}
                          <span className="font-medium">
                            {message.messageType}
                          </span>
                          {getStatusBadge(message.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sent to {message.recipientCount} clients
                      </p>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
