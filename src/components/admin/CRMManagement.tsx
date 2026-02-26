"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Copy,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Shield,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface CRMKey {
    id: number;
    name: string;
    masked_key: string;
    is_active: boolean;
    created_at: string;
    revoked_at?: string;
    plain_key?: string;
}

export function CRMManagement() {
    const [keys, setKeys] = useState<CRMKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [generatedKey, setGeneratedKey] = useState<CRMKey | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchKeys = async () => {
        try {
            setIsLoading(true);
            const data = (await apiClient.request("/crm/keys")) as CRMKey[];
            setKeys(data);
        } catch (error) {
            console.error("Error fetching CRM keys:", error);
            toast.error("Failed to load CRM API keys");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for the key");
            return;
        }

        try {
            setIsGenerating(true);
            const data = (await apiClient.request("/crm/keys", {
                method: "POST",
                body: JSON.stringify({ name: newKeyName }),
            })) as CRMKey;

            setGeneratedKey(data);
            setIsCreateDialogOpen(false);
            setNewKeyName("");
            fetchKeys();
            toast.success("CRM API Key generated successfully");
        } catch (error) {
            console.error("Error creating key:", error);
            toast.error("Failed to generate API key");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevokeKey = async (id: number) => {
        if (!confirm("Are you sure you want to revoke this API key? This cannot be undone.")) {
            return;
        }

        try {
            await apiClient.request(`/crm/keys/${id}/revoke`, {
                method: "PATCH",
            });
            toast.success("Key revoked successfully");
            fetchKeys();
        } catch (error) {
            console.error("Error revoking key:", error);
            toast.error("Failed to revoke key");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("API Key copied to clipboard");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get service URL safely
    const getServiceUrl = () => {
        if (typeof window === 'undefined') return '/api/v1/crm/consolidated-data';
        return `${window.location.origin}/api/v1/crm/consolidated-data`;
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>CRM Integration Status</CardTitle>
                        </div>
                        <CardDescription>Configure external access for Microsoft Dynamics CRM</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="font-medium">API Service Online</span>
                            </div>
                            <Badge variant="outline">Rate Limit: 60/hr</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg">
                            <p className="font-semibold mb-2">Endpoint URL:</p>
                            <code className="text-xs break-all bg-background p-1 rounded">
                                {getServiceUrl()}
                            </code>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security Actions</CardTitle>
                        <CardDescription>Manage security and access tokens</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button className="w-full font-semibold" onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Generate New CRM API Key
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Generating a new key does not automatically revoke old ones.
                            Ensure you rotate and revoke keys as needed for security.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>CRM API Keys</CardTitle>
                    <CardDescription>Existing and previous API tokens for external sync</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-bold">Key Name</TableHead>
                                    <TableHead className="font-bold">Token (Masked)</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="font-bold">Created</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : keys.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No API keys found. Generate one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    keys.map((key) => (
                                        <TableRow key={key.id}>
                                            <TableCell className="font-medium">{key.name}</TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{key.masked_key}</code>
                                            </TableCell>
                                            <TableCell>
                                                {key.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Revoked</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(key.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {key.is_active && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleRevokeKey(key.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Revoke
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Key Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate New CRM API Key</DialogTitle>
                        <DialogDescription>
                            Give this key a label to track who or what is using it.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="key-name">Key Name / Label</Label>
                        <Input
                            id="key-name"
                            placeholder="e.g. MS Dynamics Production"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateKey} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Key"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Dialog for new key */}
            <Dialog open={!!generatedKey} onOpenChange={() => setGeneratedKey(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Key Generated Successfully
                        </DialogTitle>
                        <DialogDescription className="text-destructive font-bold pt-2">
                            CRITICAL: Copy this key now!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                        For security reasons, this key will <span className="underline decoration-destructive">never be shown again</span> once you close this window.
                    </div>
                    {generatedKey && (
                        <div className="space-y-4 py-2">
                            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg break-all font-mono text-sm relative group border border-slate-800">
                                {generatedKey.plain_key}
                                <div className="flex justify-end mt-4">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8"
                                        onClick={() => copyToClipboard(generatedKey.plain_key!)}
                                    >
                                        <Copy className="h-3 w-3 mr-2" />
                                        Copy Key
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-xs text-muted-foreground p-3 bg-amber-50 rounded border border-amber-200">
                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span>Use this as a Bearer token in the <code>Authorization</code> header of your CRM system requests.</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button className="w-full" onClick={() => setGeneratedKey(null)}>I have saved the key securely</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
