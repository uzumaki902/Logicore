import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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

    async function handleUpload() {
        if (!filename.trim() || !content.trim()) return;
        setUploading(true);

        const res = await apiPost("/api/knowledge/upload", {
            filename: filename.trim(),
            content: content.trim(),
        });

        if (res.ok) {
            setFilename("");
            setContent("");
            // Poll for status updates
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
        const res = await apiPost<{ results: SearchResult[] }>("/api/knowledge/search", {
            query: searchQuery.trim(),
        });
        if (res.ok) {
            setSearchResults(res.data.results);
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
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                                Document Name
                            </label>
                            <input
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                placeholder="e.g., refund-policy.txt"
                                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#0B0F14] px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                                Document Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste the document content here..."
                                className="mt-1 min-h-36 w-full rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#0B0F14] px-4 py-3 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200 resize-none"
                            />
                            <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                                Text will be chunked and embedded for semantic search.
                            </p>
                        </div>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading || !filename.trim() || !content.trim()}
                            className="h-10 w-full rounded-xl bg-[#6366F1] text-white font-medium hover:bg-[#7C83FF] transition-all duration-200 hover:scale-[1.01] press-scale disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                    Uploading...
                                </span>
                            ) : (
                                "📄 Upload Document"
                            )}
                        </Button>
                    </div>
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
