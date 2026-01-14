"use client";
import { useState, useEffect, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fetchData, sendData } from "@/lib/api";
import { createPaymentLink, getVouchers } from "@/lib/paymentService";
import { getAppClients } from "@/lib/fetchers/app";
import {
  Calendar,
  Copy,
  Send,
  Sparkles,
  Link as LinkIcon,
  Search,
  X,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentLinkCreator() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [debouncedClientSearch, setDebouncedClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClientIndex, setSelectedClientIndex] = useState(-1);
  const [programs, setPrograms] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const clientSearchRef = useRef(null);
  const clientDropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    clientId: "",
    programId: "",
    amount: "",
    paymentType: "full",
    dueDate: "",
    voucherCode: "",
    customNote: "",
    aiNote: "",
    useAINote: false,
    language: "english",
  });
  const [paymentId, setPaymentId] = useState("");

  // Fetch clients, programs, and vouchers on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Debounce client search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedClientSearch(clientSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearch]);

  const fetchInitialData = async () => {
    try {
      // Fetch clients with middleware filtering
      const clientsResponse = await getAppClients({ limit: 100 });
      if (clientsResponse.status_code === 200) {
        setClients(clientsResponse.data || []);
      }

      // Fetch programs
      const programsResponse = await fetchData("app/programs");
      if (programsResponse.status_code === 200) {
        setPrograms(programsResponse.data || []);
      }

      // Fetch vouchers
      const vouchersResponse = await getVouchers();
      if (vouchersResponse.status_code === 200) {
        setVouchers(vouchersResponse.data || []);
      }
    } catch (error) {
      toast.error("Failed to load initial data");
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!formData.clientId || !formData.amount || !formData.paymentType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      let finalNote = formData.customNote;
      // AI note logic (unchanged)
      if (formData.useAINote && !formData.aiNote) {
        // ...existing code...
        // (AI note generation logic remains unchanged)
      } else if (formData.useAINote && formData.aiNote) {
        finalNote = formData.aiNote;
      }

      // Prepare payload for custom-url endpoint
      const payload = {
        clientId: formData.clientId,
        program: selectedProgram || {
          name: "Custom Program",
          description: "Custom payment",
        },
        amount: parseFloat(formData.amount),
        type: formData.paymentType,
        dueDate: formData.dueDate,
        voucherCode: formData.voucherCode || null,
        customNote: finalNote,
        language: formData.language,
      };

      // Call backend to create payment/order and get custom URL
      const response = await sendData("app/payment/custom-url", payload);

      // Only create the order and redirect to payment page
      if (response.success === true && response.data?.customUrl) {
        toast.success("Payment link created successfully");
        setPaymentCreated(true);

        // Store the payment ID for sending reminders
        if (response.data.paymentId) {
          setPaymentId(response.data.paymentId);
        }

        // Show AI invoice note if present
        if (response.data.invoiceNote) {
          setFormData((prev) => ({
            ...prev,
            aiNote: response.data.invoiceNote,
          }));
          toast.info("AI note generated:");
        }
        // Redirect to payment page for payment
        try {
          const url = response.data.customUrl;
          copyToClipboard(url);
          toast.success("Payment link copied to clipboard");
        } catch (e) {
          copyToClipboard(response.data.customUrl);
        }
      } else {
        throw new Error(response.message || "Failed to create payment link");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create payment link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      programId: "",
      amount: "",
      paymentType: "full",
      dueDate: "",
      voucherCode: "",
      customNote: "",
      aiNote: "",
      useAINote: false,
      language: "english",
    });
    setClientSearch("");
    setDebouncedClientSearch("");
    setShowClientDropdown(false);
    setSelectedClientIndex(-1);
    setPaymentCreated(false);
    setPaymentId("");
  };

  const sendPaymentLink = async () => {
    if (!formData.clientId || !formData.amount) {
      toast.error("Please create a payment link first");
      return;
    }

    setLoading(true);
    try {
      // First, we need to get the payment ID from the created payment
      // Since we're creating a payment link, we should store the payment ID
      if (!paymentCreated) {
        toast.error("Please create a payment link first before sending");
        setLoading(false);
        return;
      }

      // Use the integrated communication endpoint with AI
      const response = await sendData("app/communication/payment-reminder", {
        paymentId: paymentId, // Use the stored payment ID
        tone: "friendly",
        customMessage: formData.useAINote
          ? formData.aiNote
          : formData.customNote,
      });

      if (response.success === true) {
        toast.success("Payment reminder sent successfully");

        // Show communication results
        if (response.data) {
          const { whatsappSent, pushSent, reminderMessage } = response.data;
          let message = "Reminder sent via: ";
          if (whatsappSent) message += "WhatsApp ";
          if (pushSent) message += "Push notification ";
          if (whatsappSent || pushSent) {
            toast.info(message.trim());
          }
        }
      } else {
        throw new Error(response.message || "Failed to send payment reminder");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send payment reminder");
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find((c) => c._id === formData.clientId);
  const selectedProgram = programs.find((p) => p._id === formData.programId);
  const selectedVoucher = vouchers.find((v) => v.code === formData.voucherCode);

  // Filter clients by search with enhanced matching (using debounced search)
  const filteredClients = debouncedClientSearch.trim()
    ? clients.filter(
      (client) =>
        client.name
          ?.toLowerCase()
          .includes(debouncedClientSearch.toLowerCase()) ||
        client.mobileNumber
          ?.toLowerCase()
          .includes(debouncedClientSearch.toLowerCase()) ||
        client.email
          ?.toLowerCase()
          .includes(debouncedClientSearch.toLowerCase())
    )
    : clients;

  // Handle client search input
  const handleClientSearch = (value) => {
    setClientSearch(value);
    setShowClientDropdown(true);
    setSelectedClientIndex(-1);

    // If search is cleared, clear selected client
    if (!value.trim()) {
      setFormData((prev) => ({ ...prev, clientId: "" }));
    }
  };

  // Handle client selection
  const handleClientSelect = (client) => {
    setFormData((prev) => ({ ...prev, clientId: client._id }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
    setSelectedClientIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showClientDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedClientIndex((prev) =>
          prev < filteredClients.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedClientIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedClientIndex >= 0 && filteredClients[selectedClientIndex]) {
          handleClientSelect(filteredClients[selectedClientIndex]);
        }
        break;
      case "Escape":
        setShowClientDropdown(false);
        setSelectedClientIndex(-1);
        break;
    }
  };

  // Clear client selection
  const clearClientSelection = () => {
    setFormData((prev) => ({ ...prev, clientId: "" }));
    setClientSearch("");
    setDebouncedClientSearch("");
    setShowClientDropdown(false);
    setSelectedClientIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        clientSearchRef.current &&
        !clientSearchRef.current.contains(event.target) &&
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(event.target)
      ) {
        setShowClientDropdown(false);
        setSelectedClientIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Payment Link</h1>
          <p className="text-muted-foreground">
            Generate payment links for your clients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enhanced Client Search & Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <div className="relative" ref={clientSearchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="client-search"
                    type="text"
                    placeholder="Search clients by name, phone, or email..."
                    value={clientSearch}
                    onChange={(e) => handleClientSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowClientDropdown(true)}
                    className="pl-10 pr-10"
                    autoComplete="off"
                  />
                  {clientSearch && (
                    <button
                      onClick={clearClientSelection}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showClientDropdown && (
                  <div
                    ref={clientDropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    {filteredClients.length === 0 ? (
                      <div className="px-4 py-3 text-muted-foreground text-sm">
                        {clientSearch.trim()
                          ? "No clients found"
                          : "Start typing to search clients..."}
                      </div>
                    ) : (
                      filteredClients.map((client, index) => (
                        <div
                          key={client._id}
                          onClick={() => handleClientSelect(client)}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${index === selectedClientIndex
                              ? "bg-blue-50 border-blue-200"
                              : ""
                            } ${formData.clientId === client._id
                              ? "bg-green-50"
                              : ""
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {client.name}
                                </span>
                                {formData.clientId === client._id && (
                                  <Check className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {client.mobileNumber && (
                                  <span className="mr-3">
                                    📱 {client.mobileNumber}
                                  </span>
                                )}
                                {client.email && <span>✉️ {client.email}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Client Display */}
              {selectedClient && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Selected: {selectedClient.name}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {selectedClient.mobileNumber &&
                      `Phone: ${selectedClient.mobileNumber}`}
                    {selectedClient.mobileNumber &&
                      selectedClient.email &&
                      " • "}
                    {selectedClient.email && `Email: ${selectedClient.email}`}
                  </div>
                </div>
              )}
            </div>

            {/* Program Selection */}
            <div className="space-y-2">
              <Label htmlFor="program">Program (Optional)</Label>
              <Select
                value={formData.programId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, programId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program._id} value={program._id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type *</Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="installment">
                    Installment Payment
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>


            <Separator />

            {/* Note Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Payment Note</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.useAINote}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, useAINote: checked }))
                    }
                  />
                  <Label className="text-sm">Use AI Note</Label>
                </div>
              </div>

              {formData.useAINote ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="gu">Gujarati</SelectItem>
                        <SelectItem value="ma">Marathi</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    AI note will be generated automatically when you create the
                    payment link
                  </div>
                  <Textarea
                    placeholder="AI-generated note will appear here after payment link creation..."
                    value={formData.aiNote}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aiNote: e.target.value,
                      }))
                    }
                    rows={3}
                    readOnly
                  />
                </div>
              ) : (
                <Textarea
                  placeholder="Enter custom note for the payment..."
                  value={formData.customNote}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customNote: e.target.value,
                    }))
                  }
                  rows={3}
                />
              )}
            </div>

            <div className="flex space-x-2">
              {!paymentCreated ? (
                <>
                  <Button
                    onClick={handleCreatePaymentLink}
                    disabled={
                      loading ||
                      !formData.clientId ||
                      !formData.amount ||
                      !formData.paymentType
                    }
                    className="flex-1"
                  >
                    {loading ? "Creating..." : "Create Payment Link"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={sendPaymentLink}
                    disabled={
                      loading ||
                      !formData.clientId ||
                      !formData.amount ||
                      !formData.paymentType ||
                      !paymentId
                    }
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Create New Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={sendPaymentLink}
                    disabled={
                      !formData.clientId ||
                      !formData.amount ||
                      !formData.paymentType ||
                      !paymentId
                    }
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                </>
              )}
            </div>

            {/* Help text for payment reminders */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>💡 Payment Reminders:</strong> After creating a payment
                link, you can send automated reminders to your client via
                WhatsApp and push notifications. The reminder will include the
                payment details and a personalized message.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Link Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Client Details</h4>
                <p>
                  <strong>Name:</strong> {selectedClient.name}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedClient.mobileNumber}
                </p>
                {selectedClient.email && (
                  <p>
                    <strong>Email:</strong> {selectedClient.email}
                  </p>
                )}
              </div>
            )}

            {selectedProgram && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Program Details</h4>
                <p>
                  <strong>Program:</strong> {selectedProgram.name}
                </p>
                <p>
                  <strong>Duration:</strong> {selectedProgram.duration}
                </p>
                <p>
                  <strong>Description:</strong> {selectedProgram.description}
                </p>
              </div>
            )}

            {formData.amount && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Payment Details</h4>
                <p>
                  <strong>Amount:</strong> ₹{formData.amount}
                </p>
                <p>
                  <strong>Payment Type:</strong>{" "}
                  {formData.paymentType.charAt(0).toUpperCase() +
                    formData.paymentType.slice(1)}{" "}
                  Payment
                </p>
                {selectedVoucher && (
                  <div className="mt-2">
                    <Badge variant="secondary">{selectedVoucher.code}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {selectedVoucher.discount}% discount applied
                    </p>
                  </div>
                )}
                {formData.dueDate && (
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {new Date(formData.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {(formData.customNote || formData.aiNote) && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Note</h4>
                <p className="text-sm">
                  {formData.useAINote ? formData.aiNote : formData.customNote}
                </p>
              </div>
            )}

            {!selectedClient && !formData.amount && (
              <div className="text-center text-muted-foreground py-8">
                <LinkIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Fill in the form to see payment link preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
