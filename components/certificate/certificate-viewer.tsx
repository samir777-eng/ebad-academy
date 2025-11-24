"use client";

import { Award, Download, Loader2, Share2 } from "lucide-react";
import { useState } from "react";

type CertificateData = {
  studentName: string;
  studentId: string;
  levelNumber: number;
  levelName: string;
  levelNameAr: string;
  completionDate: Date;
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  certificateId: string;
};

type CertificateViewerProps = {
  levelNumber: number;
  locale: string;
};

export function CertificateViewer({
  levelNumber,
  locale,
}: CertificateViewerProps) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRTL = locale === "ar";

  const generateCertificate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate certificate");
      }

      setCertificate(data.certificate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificate) return;

    // Create a simple HTML certificate for download
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate - ${certificate.studentName}</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { color: #667eea; font-size: 48px; margin-bottom: 20px; }
          h2 { color: #333; font-size: 32px; margin: 30px 0; }
          .student-name { color: #764ba2; font-size: 36px; font-weight: bold; }
          .details { margin: 30px 0; color: #666; }
          .footer { margin-top: 50px; color: #999; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>🎓 Certificate of Completion</h1>
          <h2>Ebad Academy</h2>
          <p class="details">This certifies that</p>
          <p class="student-name">${certificate.studentName}</p>
          <p class="details">has successfully completed</p>
          <h2>Level ${certificate.levelNumber}: ${certificate.levelName}</h2>
          <p class="details">
            Completed ${certificate.completedLessons} of ${
      certificate.totalLessons
    } lessons<br>
            Average Score: ${certificate.averageScore}%<br>
            Completion Date: ${new Date(
              certificate.completionDate
            ).toLocaleDateString()}
          </p>
          <div class="footer">
            <p>Certificate ID: ${certificate.certificateId}</p>
            <p>Student ID: ${certificate.studentId}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certificateHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ebad-Academy-Certificate-Level-${levelNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 mx-auto mb-4 text-red-400" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={generateCertificate}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          {isRTL ? "حاول مرة أخرى" : "Try Again"}
        </button>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 mx-auto mb-4 text-primary-400" />
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isRTL
            ? "احصل على شهادة إتمام المستوى"
            : "Get your level completion certificate"}
        </p>
        <button
          onClick={generateCertificate}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{isRTL ? "جاري الإنشاء..." : "Generating..."}</span>
            </>
          ) : (
            <>
              <Award className="h-5 w-5" />
              <span>{isRTL ? "إنشاء الشهادة" : "Generate Certificate"}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Display certificate
  return (
    <div className="space-y-6">
      {/* Certificate Display */}
      <div className="bg-gradient-to-br from-primary-500 via-secondary-500 to-purple-600 p-8 rounded-2xl shadow-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Award className="h-20 w-20 mx-auto mb-4 text-primary-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {isRTL ? "شهادة إتمام" : "Certificate of Completion"}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {isRTL ? "أكاديمية عباد" : "Ebad Academy"}
            </p>
          </div>

          {/* Body */}
          <div className="text-center space-y-6">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isRTL ? "هذا يشهد بأن" : "This certifies that"}
            </p>

            <p className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
              {certificate.studentName}
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isRTL ? "قد أتم بنجاح" : "has successfully completed"}
            </p>

            <div className="py-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {isRTL
                  ? `المستوى ${certificate.levelNumber}`
                  : `Level ${certificate.levelNumber}`}
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mt-2">
                {isRTL ? certificate.levelNameAr : certificate.levelName}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? "الدروس" : "Lessons"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {certificate.completedLessons}/{certificate.totalLessons}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? "المعدل" : "Average"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {certificate.averageScore}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? "التاريخ" : "Date"}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(certificate.completionDate).toLocaleDateString(
                    locale
                  )}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>
                {isRTL ? "رقم الشهادة" : "Certificate ID"}:{" "}
                {certificate.certificateId}
              </p>
              <p>
                {isRTL ? "رقم الطالب" : "Student ID"}: {certificate.studentId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={downloadCertificate}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <Download className="h-5 w-5" />
          <span>{isRTL ? "تحميل الشهادة" : "Download Certificate"}</span>
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Ebad Academy - Level ${certificate.levelNumber} Certificate`,
                text: `I completed Level ${certificate.levelNumber} at Ebad Academy!`,
              });
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
        >
          <Share2 className="h-5 w-5" />
          <span>{isRTL ? "مشاركة" : "Share"}</span>
        </button>
      </div>
    </div>
  );
}
