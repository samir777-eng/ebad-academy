"use client";

import { Loader2, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuestionBuilder } from "./question-builder";

type Level = {
  id: number;
  levelNumber: number;
  nameEn: string;
  nameAr: string;
};

type Branch = {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
};

type Question = {
  id?: number;
  questionTextEn: string;
  questionTextAr: string;
  type: string;
  optionsEn: string | null;
  optionsAr: string | null;
  correctAnswer: string;
  explanationEn: string | null;
  explanationAr: string | null;
  order: number;
};

type Lesson = {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  videoUrlsEn: string | null;
  videoUrlsAr: string | null;
  pdfUrlEn?: string | null;
  duration: number;
  order: number;
  levelId: number;
  branchId: number;
  questions: Question[];
};

type LessonFormProps = {
  locale: string;
  levels: Level[];
  branches: Branch[];
  lesson?: Lesson;
  mode: "create" | "edit";
};

export function LessonForm({
  locale,
  levels,
  branches,
  lesson,
  mode,
}: LessonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    titleEn: lesson?.titleEn || "",
    titleAr: lesson?.titleAr || "",
    descriptionEn: lesson?.descriptionEn || "",
    descriptionAr: lesson?.descriptionAr || "",
    videoUrlsEn: lesson?.videoUrlsEn
      ? JSON.parse(lesson.videoUrlsEn).join("\n")
      : "",
    videoUrlsAr: lesson?.videoUrlsAr
      ? JSON.parse(lesson.videoUrlsAr).join("\n")
      : "",
    pdfUrl: lesson?.pdfUrlEn || "",
    duration: lesson?.duration || 0,
    order: lesson?.order || 1,
    levelId: lesson?.levelId || levels[0]?.id || 1,
    branchId: lesson?.branchId || branches[0]?.id || 1,
  });

  const [questions, setQuestions] = useState<Question[]>(
    lesson?.questions || []
  );
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState(
    lesson?.pdfUrlEn ? lesson.pdfUrlEn.split("/").pop() : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse video URLs
      const videoUrlsEnArray = formData.videoUrlsEn
        .split("\n")
        .map((url: string) => url.trim())
        .filter((url: string) => url);
      const videoUrlsArArray = formData.videoUrlsAr
        .split("\n")
        .map((url: string) => url.trim())
        .filter((url: string) => url);

      const payload = {
        ...formData,
        videoUrlsEn: JSON.stringify(videoUrlsEnArray),
        videoUrlsAr: JSON.stringify(videoUrlsArArray),
        questions: questions.map((q, index) => ({
          ...q,
          order: index + 1,
          optionsEn: q.optionsEn,
          optionsAr: q.optionsAr,
        })),
      };

      const url =
        mode === "create"
          ? "/api/admin/lessons"
          : `/api/admin/lessons/${lesson?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save lesson");
      }

      router.push(`/${locale}/admin/lessons`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionTextEn: "",
        questionTextAr: "",
        type: "multiple_choice",
        optionsEn: JSON.stringify([]),
        optionsAr: JSON.stringify([]),
        correctAnswer: "",
        explanationEn: "",
        explanationAr: "",
        order: questions.length + 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload PDF");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, pdfUrl: data.url }));
      setPdfFileName(data.filename);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  const removePdf = () => {
    setFormData({ ...formData, pdfUrl: "" });
    setPdfFileName("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title (English)
            </label>
            <input
              type="text"
              required
              value={formData.titleEn}
              onChange={(e) =>
                setFormData({ ...formData, titleEn: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title (Arabic)
            </label>
            <input
              type="text"
              required
              value={formData.titleAr}
              onChange={(e) =>
                setFormData({ ...formData, titleAr: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (English)
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionEn}
              onChange={(e) =>
                setFormData({ ...formData, descriptionEn: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Arabic)
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionAr}
              onChange={(e) =>
                setFormData({ ...formData, descriptionAr: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Level
            </label>
            <select
              required
              value={formData.levelId}
              onChange={(e) =>
                setFormData({ ...formData, levelId: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  Level {level.levelNumber} - {level.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Branch
            </label>
            <select
              required
              value={formData.branchId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  branchId: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* PDF Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Study Material (PDF)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Upload a PDF file for students to download (max 10MB)
        </p>
        {formData.pdfUrl ? (
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                📄 {pdfFileName}
              </p>
              <a
                href={formData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 dark:text-green-400 hover:underline"
              >
                View PDF
              </a>
            </div>
            <button
              type="button"
              onClick={removePdf}
              className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <label className="block">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={uploadingPdf}
                className="hidden"
                id="pdf-upload"
              />
              <div className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                {uploadingPdf ? (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Click to upload PDF
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Max file size: 10MB
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Video URLs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Video URLs
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Enter one URL per line
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video URLs (English)
            </label>
            <textarea
              rows={5}
              value={formData.videoUrlsEn}
              onChange={(e) =>
                setFormData({ ...formData, videoUrlsEn: e.target.value })
              }
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video URLs (Arabic)
            </label>
            <textarea
              rows={5}
              value={formData.videoUrlsAr}
              onChange={(e) =>
                setFormData({ ...formData, videoUrlsAr: e.target.value })
              }
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Quiz Questions ({questions.length})
          </h2>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Questions will be shown in the order listed below. Click on a question
          to expand and edit it.
        </p>
        <QuestionBuilder questions={questions} onChange={setQuestions} />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {mode === "create" ? "Create Lesson" : "Update Lesson"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
