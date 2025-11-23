"use client";

import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

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

type QuestionBuilderProps = {
  questions: Question[];
  onChange: (questions: Question[]) => void;
};

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addOption = (questionIndex: number, language: "En" | "Ar") => {
    const question = questions[questionIndex];
    const optionsKey = `options${language}` as "optionsEn" | "optionsAr";
    const options = question[optionsKey]
      ? JSON.parse(question[optionsKey])
      : [];
    options.push("");
    updateQuestion(questionIndex, optionsKey, JSON.stringify(options));
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
    language: "En" | "Ar"
  ) => {
    const question = questions[questionIndex];
    const optionsKey = `options${language}` as "optionsEn" | "optionsAr";
    const options = JSON.parse(question[optionsKey] || "[]");
    options[optionIndex] = value;
    updateQuestion(questionIndex, optionsKey, JSON.stringify(options));
  };

  const removeOption = (
    questionIndex: number,
    optionIndex: number,
    language: "En" | "Ar"
  ) => {
    const question = questions[questionIndex];
    const optionsKey = `options${language}` as "optionsEn" | "optionsAr";
    const options = JSON.parse(question[optionsKey] || "[]");
    options.splice(optionIndex, 1);
    updateQuestion(questionIndex, optionsKey, JSON.stringify(options));
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);

    if (expandedIndex === index) {
      setExpandedIndex(newIndex);
    } else if (expandedIndex === newIndex) {
      setExpandedIndex(index);
    }
  };

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No questions yet. Click "Add Question" to create one.
        </div>
      ) : (
        questions.map((question, index) => {
          const isExpanded = expandedIndex === index;
          const optionsEn = question.optionsEn
            ? JSON.parse(question.optionsEn)
            : [];
          const optionsAr = question.optionsAr
            ? JSON.parse(question.optionsAr)
            : [];

          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Question Header */}
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Question {index + 1}
                  </span>
                  {question.questionTextEn && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                      {question.questionTextEn}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, "down")}
                    disabled={index === questions.length - 1}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Question Content - Expanded */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                  {/* Question Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Type *
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        updateQuestion(index, "type", newType);

                        // Auto-populate True/False options
                        if (newType === "true_false") {
                          updateQuestion(
                            index,
                            "optionsEn",
                            JSON.stringify(["True", "False"])
                          );
                          updateQuestion(
                            index,
                            "optionsAr",
                            JSON.stringify(["صحيح", "خطأ"])
                          );
                          // Set default correct answer to True (index 0)
                          if (!question.correctAnswer) {
                            updateQuestion(index, "correctAnswer", "0");
                          }
                        } else if (
                          newType === "multiple_choice" &&
                          question.type === "true_false"
                        ) {
                          // Clear options when switching from true/false to multiple choice
                          updateQuestion(
                            index,
                            "optionsEn",
                            JSON.stringify([])
                          );
                          updateQuestion(
                            index,
                            "optionsAr",
                            JSON.stringify([])
                          );
                          updateQuestion(index, "correctAnswer", "");
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="multiple_choice">
                        Multiple Choice (A, B, C, D)
                      </option>
                      <option value="true_false">True/False (صحيح/خطأ)</option>
                    </select>
                  </div>

                  {/* Question Text */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question (English) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={question.questionTextEn}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "questionTextEn",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Enter question in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question (Arabic) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={question.questionTextAr}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "questionTextAr",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="أدخل السؤال بالعربية"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Options Section */}
                  {question.type === "true_false" ? (
                    /* True/False - Simple Radio Selection */
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Select Correct Answer *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(index, "correctAnswer", "0")
                          }
                          className={`p-4 rounded-lg border-2 transition-all ${
                            question.correctAnswer === "0"
                              ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                              : "border-gray-300 dark:border-gray-600 hover:border-green-300"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">✓</div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              True / صحيح
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(index, "correctAnswer", "1")
                          }
                          className={`p-4 rounded-lg border-2 transition-all ${
                            question.correctAnswer === "1"
                              ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                              : "border-gray-300 dark:border-gray-600 hover:border-green-300"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">✗</div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              False / خطأ
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Multiple Choice - Full Options Editor */
                    <>
                      {/* Options - English */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Options (English) *
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(index, "En")}
                            className="text-xs flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            <Plus className="w-3 h-3" />
                            Add Option
                          </button>
                        </div>
                        <div className="space-y-2">
                          {optionsEn.map((option: string, optIndex: number) => (
                            <div
                              key={optIndex}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={
                                  question.correctAnswer === optIndex.toString()
                                }
                                onChange={() =>
                                  updateQuestion(
                                    index,
                                    "correctAnswer",
                                    optIndex.toString()
                                  )
                                }
                                className="w-4 h-4 text-primary-600"
                                title="Mark as correct answer"
                              />
                              <input
                                type="text"
                                required
                                value={option}
                                onChange={(e) =>
                                  updateOption(
                                    index,
                                    optIndex,
                                    e.target.value,
                                    "En"
                                  )
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeOption(index, optIndex, "En")
                                }
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Options - Arabic */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Options (Arabic) *
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(index, "Ar")}
                            className="text-xs flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            <Plus className="w-3 h-3" />
                            إضافة خيار
                          </button>
                        </div>
                        <div className="space-y-2">
                          {optionsAr.map((option: string, optIndex: number) => (
                            <div
                              key={optIndex}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                required
                                value={option}
                                onChange={(e) =>
                                  updateOption(
                                    index,
                                    optIndex,
                                    e.target.value,
                                    "Ar"
                                  )
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder={`الخيار ${optIndex + 1}`}
                                dir="rtl"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeOption(index, optIndex, "Ar")
                                }
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Correct Answer Indicator */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      {question.correctAnswer !== "" ? (
                        <>
                          ✓ Correct answer: Option{" "}
                          {parseInt(question.correctAnswer) + 1}
                        </>
                      ) : (
                        <>
                          ⚠️ Please select the correct answer by clicking the
                          radio button
                        </>
                      )}
                    </p>
                  </div>

                  {/* Explanations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Explanation (English)
                      </label>
                      <textarea
                        rows={3}
                        value={question.explanationEn || ""}
                        onChange={(e) =>
                          updateQuestion(index, "explanationEn", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Optional explanation for the answer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Explanation (Arabic)
                      </label>
                      <textarea
                        rows={3}
                        value={question.explanationAr || ""}
                        onChange={(e) =>
                          updateQuestion(index, "explanationAr", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="شرح اختياري للإجابة"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
