import { Injectable, Logger } from '@nestjs/common';

// ---- Language detection based on file extensions ----

export type ProgrammingLanguage =
  | 'C++'
  | 'Java'
  | 'Python'
  | 'JavaScript'
  | 'TypeScript'
  | 'Rust'
  | 'Go'
  | 'C#'
  | 'Ruby'
  | 'PHP'
  | 'Swift'
  | 'Kotlin'
  | 'Unknown';

interface LanguageStats {
  language: ProgrammingLanguage;
  fileCount: number;
  percentage: number;
}

@Injectable()
export class LanguageDetectorService {
  private readonly logger = new Logger(LanguageDetectorService.name);

  // Map file extensions to programming languages
  private readonly extensionMap: Record<string, ProgrammingLanguage> = {
    // C++
    '.cpp': 'C++',
    '.cc': 'C++',
    '.cxx': 'C++',
    '.hpp': 'C++',
    '.h': 'C++',
    '.hxx': 'C++',

    // Java
    '.java': 'Java',

    // Python
    '.py': 'Python',
    '.pyw': 'Python',
    '.pyx': 'Python',

    // JavaScript
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.mjs': 'JavaScript',

    // TypeScript
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',

    // Rust
    '.rs': 'Rust',

    // Go
    '.go': 'Go',

    // C#
    '.cs': 'C#',

    // Ruby
    '.rb': 'Ruby',

    // PHP
    '.php': 'PHP',

    // Swift
    '.swift': 'Swift',

    // Kotlin
    '.kt': 'Kotlin',
    '.kts': 'Kotlin',
  };

  /**
   * Detect the primary programming language from a list of file paths
   * @param filePaths - Array of file paths from commit
   * @returns The dominant programming language
   */
  detectLanguage(filePaths: string[]): ProgrammingLanguage {
    if (!filePaths || filePaths.length === 0) {
      return 'Unknown';
    }

    const languageCounts = new Map<ProgrammingLanguage, number>();

    // Count files by language
    for (const filePath of filePaths) {
      const extension = this.getFileExtension(filePath);
      const language = this.extensionMap[extension] || 'Unknown';

      if (language !== 'Unknown') {
        languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
      }
    }

    // Find the language with the most files
    let dominantLanguage: ProgrammingLanguage = 'Unknown';
    let maxCount = 0;

    for (const [language, count] of languageCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantLanguage = language;
      }
    }

    this.logger.log(
      `Detected language: ${dominantLanguage} (${maxCount}/${filePaths.length} files)`,
    );

    return dominantLanguage;
  }

  /**
   * Get detailed language statistics from file paths
   * @param filePaths - Array of file paths
   * @returns Array of language statistics sorted by percentage
   */
  getLanguageStats(filePaths: string[]): LanguageStats[] {
    if (!filePaths || filePaths.length === 0) {
      return [];
    }

    const languageCounts = new Map<ProgrammingLanguage, number>();
    let totalCodeFiles = 0;

    for (const filePath of filePaths) {
      const extension = this.getFileExtension(filePath);
      const language = this.extensionMap[extension];

      if (language) {
        languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
        totalCodeFiles++;
      }
    }

    const stats: LanguageStats[] = [];
    for (const [language, count] of languageCounts.entries()) {
      stats.push({
        language,
        fileCount: count,
        percentage: Math.round((count / totalCodeFiles) * 100),
      });
    }

    // Sort by file count descending
    return stats.sort((a, b) => b.fileCount - a.fileCount);
  }

  /**
   * Map programming language to Gotchi theme
   * @param language - Detected programming language
   * @returns Gotchi theme string
   */
  mapLanguageToTheme(language: ProgrammingLanguage): string {
    const themeMap: Record<ProgrammingLanguage, string> = {
      'C++': 'C++',
      'Java': 'Java',
      'Python': 'Python',
      'JavaScript': 'JS',
      'TypeScript': 'TypeScript',
      'Rust': 'Rust',
      'Go': 'Go',
      'C#': 'C#',
      'Ruby': 'Ruby',
      'PHP': 'PHP',
      'Swift': 'Swift',
      'Kotlin': 'Kotlin',
      'Unknown': 'JS', // Default fallback
    };

    return themeMap[language] || 'JS';
  }

  /**
   * Extract file extension from path
   */
  private getFileExtension(filePath: string): string {
    const lastDot = filePath.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filePath.substring(lastDot).toLowerCase();
  }
}
