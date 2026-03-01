import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

type Document = {
    id: string;
    filename: string;
    file_size: number;
    chunk_count: number;
    status: string;
    created_at: string;
};

type SearchResult = {
    chunk_text: string;
    filename: string;
    similarity: number;
};

export default function KnowledgeBase() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [filename, setFilename] = useState("");
    const [content, setContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
    const [docUrl, setDocUrl] = useState("");
    const [isPdf, setIsPdf] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    async function fetchDocuments() {
        const res = await apiGet<{ documents: Document[] }>("/api/knowledge/documents");
        if (res.ok) {
            setDocuments(res.data.documents);
        }
        setLoading(false);
    }

    function readFile(file: File) {
        setFilename(file.name);

        if (file.name.endsWith(".pdf")) {
            // Read PDF as base64
            setIsPdf(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const base64 = btoa(
                    new Uint8Array(arrayBuffer).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ""
                    )
                );
                setContent(base64);
            };
            reader.readAsArrayBuffer(file);
        } else {
            // Read text files normally
            setIsPdf(false);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setContent(text);
            };
            reader.readAsText(file);
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) readFile(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
    }

    async function handleUpload() {
        if (!filename.trim() || !content.trim()) return;
        setUploading(true);

        let res;
        if (isPdf) {
            res = await apiPost("/api/knowledge/upload-pdf", {
                filename: filename.trim(),
                pdfBase64: content,
            });
        } else {
            res = await apiPost("/api/knowledge/upload", {
                filename: filename.trim(),
                content: content.trim(),
            });
        }

        if (res.ok) {
            setFilename("");
            setContent("");
            setIsPdf(false);
            // Poll for status updates
            setTimeout(fetchDocuments, 1000);
            setTimeout(fetchDocuments, 3000);
            setTimeout(fetchDocuments, 6000);
            fetchDocuments();
        }
        setUploading(false);
    }

    async function handleUrlUpload() {
        if (!docUrl.trim()) return;
        setUploading(true);

        const res = await apiPost("/api/knowledge/upload-url", {
            url: docUrl.trim(),
        });

        if (res.ok) {
            setDocUrl("");
            setTimeout(fetchDocuments, 1000);
            setTimeout(fetchDocuments, 3000);
            setTimeout(fetchDocuments, 6000);
            fetchDocuments();
        }
        setUploading(false);
    }

    async function handleDelete(id: string) {
        const res = await apiDelete(`/api/knowledge/documents/${id}`);
        if (res.ok) {
            setDocuments((prev) => prev.filter((d) => d.id !== id));
        }
    }

    async function handleSearch() {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setSearchError("");
        setSearchResults([]);
        try {
            const res = await apiPost<{ results: SearchResult[]; error?: string }>("/api/knowledge/search", {
                query: searchQuery.trim(),
            });
            if (res.ok && res.data.results) {
                setSearchResults(res.data.results);
                if (res.data.results.length === 0) {
                    setSearchError("No matching results found. Make sure your document status is 'Ready'.");
                }
            } else {
                setSearchError((res.data as any)?.error || `Search failed (status ${res.status})`);
            }
        } catch (err: any) {
            setSearchError(err?.message || "Network error — is the backend running?");
        }
        setSearching(false);
    }

    const statusConfig: Record<string, { color: string; label: string }> = {
        processing: { color: "bg-amber-400", label: "Processing" },
        ready: { color: "bg-emerald-500", label: "Ready" },
        error: { color: "bg-red-400", label: "Error" },
    };

    if (loading) {
        return (
            <div className="space-y-8 fade-in">
                <div>
                    <div className="skeleton h-7 w-48 mb-2" />
                    <div className="skeleton h-4 w-80" />
                </div>
                <div className="skeleton h-48 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Knowledge Base
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Upload documents to give the AI agent internal context for better responses.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Upload Section */}
                <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 transition-colors duration-200">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Upload Document
                    </h2>

                    {/* Mode Tabs */}
                    <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-[#0B0F14] p-1 mb-4">
                        <button
                            onClick={() => setUploadMode("file")}
                            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${uploadMode === "file" ? "bg-white dark:bg-[#1A2233] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"}`}
                        >
                            📁 File Upload
                        </button>
                        <button
                            onClick={() => setUploadMode("url")}
                            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${uploadMode === "url" ? "bg-white dark:bg-[#1A2233] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"}`}
                        >
                            🔗 URL Import
                        </button>
                    </div>

                    {uploadMode === "file" ? (
                        <div className="space-y-4">
                            {/* Drag & Drop / File Select Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200 ${dragOver
                                    ? "border-[#6366F1] bg-[#6366F1]/5"
                                    : "border-gray-300 dark:border-[#1F2937] hover:border-[#6366F1]/50 hover:bg-gray-50 dark:hover:bg-[#1A2233]/50"
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt,.md,.csv,.json,.log,.html,.xml,.pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#1A2233]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-500">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                                    {content ? `✅ ${filename}` : "Click to select or drag & drop"}
                                </p>
                                <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                                    .txt, .md, .csv, .json, .log, .html, .xml
                                </p>
                            </div>

                            {/* Document Name (auto-filled or manual) */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                                    Document Name
                                </label>
                                <input
                                    type="text"
                                    value={filename}
                                    onChange={(e) => setFilename(e.target.value)}
                                    placeholder="Auto-filled from file, or type manually"
                                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#0B0F14] px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200"
                                />
                            </div>

                            {/* Content preview / manual paste */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                                    Content {content ? `(${(content.length / 1024).toFixed(1)}KB)` : "— paste or upload file"}
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Content auto-fills when you upload a file, or paste manually..."
                                    className="mt-1 min-h-24 w-full rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#0B0F14] px-4 py-3 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200 resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={uploading || !filename.trim() || !content.trim()}
                                className="h-10 w-full rounded-xl bg-[#6366F1] text-white font-medium hover:bg-[#7C83FF] transition-all duration-200 hover:scale-[1.01] press-scale disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        Uploading & Embedding...
                                    </span>
                                ) : (
                                    "📄 Upload Document"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                                    Document URL
                                </label>
                                <input
                                    type="url"
                                    value={docUrl}
                                    onChange={(e) => setDocUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleUrlUpload()}
                                    placeholder="https://example.com/docs/refund-policy.pdf"
                                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#0B0F14] px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200"
                                />
                                <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                                    Supports PDF links, web pages, and plain text files.
                                </p>
                            </div>
                            <Button
                                onClick={handleUrlUpload}
                                disabled={uploading || !docUrl.trim()}
                                className="h-10 w-full rounded-xl bg-[#6366F1] text-white font-medium hover:bg-[#7C83FF] transition-all duration-200 hover:scale-[1.01] press-scale disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        Fetching & Embedding...
                                    </span>
                                ) : (
                                    "🔗 Import from URL"
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Search Test Section */}
                <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 transition-colors duration-200">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Test Search
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                                Search Query
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="e.g., how to get a refund"
                                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#0B0F14] px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={searching || !searchQuery.trim()}
                            variant="outline"
                            className="h-10 w-full rounded-xl border-gray-200 dark:border-[#1F2937] text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1A2233] transition-all duration-200"
                        >
                            {searching ? "Searching..." : "🔍 Search Knowledge Base"}
                        </Button>

                        {searchError && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                                ⚠️ {searchError}
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className="space-y-2 mt-2">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
                                    Results ({searchResults.length})
                                </p>
                                {searchResults.map((result, i) => (
                                    <div
                                        key={i}
                                        className="rounded-lg bg-gray-50 dark:bg-[#0B0F14]/50 p-3 text-sm"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-[#6366F1]">
                                                {result.filename}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                                {(result.similarity * 100).toFixed(0)}% match
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-3">
                                            {result.chunk_text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 transition-colors duration-200">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Uploaded Documents
                </h2>
                {documents.length > 0 ? (
                    <div className="space-y-3">
                        {documents.map((doc) => {
                            const sc = statusConfig[doc.status] ?? statusConfig.processing;
                            return (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between rounded-lg px-4 py-3 bg-gray-50 dark:bg-[#0B0F14]/50 transition-colors duration-200"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                            📄 {doc.filename}
                                        </p>
                                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                                            {doc.chunk_count} chunks •{" "}
                                            {(doc.file_size / 1024).toFixed(1)}KB •{" "}
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-slate-400">
                                            <span
                                                className={`inline-block h-1.5 w-1.5 rounded-full ${sc.color}`}
                                            />
                                            {sc.label}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                                            title="Delete document"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            No documents uploaded yet. Upload documents to enhance AI responses.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
