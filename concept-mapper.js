/**
 * Concept Mapper - Maps OCR output to mathematical concepts
 * Uses keyword matching and concept-graph structure for intelligent concept detection
 */

class ConceptMapper {
    constructor() {
        this.conceptGraph = this.buildConceptGraph();
        this.keywordMap = this.buildKeywordMap();
        this.latexPatterns = this.buildLatexPatterns();
    }

    /**
     * Maps OCR output to mathematical concepts
     * @param {Object} ocrOutput - OCR analysis result
     * @param {string} ocrOutput.latex - LaTeX expressions
     * @param {string} ocrOutput.text - Natural language text
     * @returns {Object} Mapped concepts with confidence scores
     */
    mapToConcepts(ocrOutput) {
        const { latex = '', text = '' } = ocrOutput;
        
        // Extract concepts from different sources
        const latexConcepts = this.extractFromLatex(latex);
        const textConcepts = this.extractFromText(text);
        const patternConcepts = this.extractFromPatterns(latex, text);
        
        // Merge and rank concepts
        const allConcepts = this.mergeConcepts(latexConcepts, textConcepts, patternConcepts);
        const rankedConcepts = this.rankConcepts(allConcepts, latex, text);
        
        return {
            concepts: rankedConcepts.map(c => c.concept),
            detailed: rankedConcepts,
            confidence: this.calculateOverallConfidence(rankedConcepts)
        };
    }

    /**
     * Builds a comprehensive concept graph with relationships
     * @returns {Object} Concept graph structure
     */
    buildConceptGraph() {
        return {
            // Core mathematical areas
            '미분': {
                aliases: ['도함수', '미분계수', 'derivative', 'differentiation'],
                related: ['함수', '극한', '연속성', '접선'],
                subconcepts: ['합성함수의 미분', '음함수의 미분', '매개변수 미분'],
                level: 'advanced'
            },
            '적분': {
                aliases: ['부정적분', '정적분', 'integral', 'integration'],
                related: ['미분', '면적', '부피', '곡선'],
                subconcepts: ['부분적분', '치환적분', '삼각치환'],
                level: 'advanced'
            },
            '극한': {
                aliases: ['limit', 'lim'],
                related: ['연속성', '미분', '수렴', '발산'],
                subconcepts: ['좌극한', '우극한', '무한극한'],
                level: 'intermediate'
            },
            '함수': {
                aliases: ['function'],
                related: ['정의역', '치역', '대응관계'],
                subconcepts: ['일대일함수', '전사함수', '합성함수'],
                level: 'basic'
            },
            '삼각함수': {
                aliases: ['trigonometric function', 'trigonometry'],
                related: ['각도', '단위원', '주기함수'],
                subconcepts: ['사인함수', '코사인함수', '탄젠트함수'],
                level: 'intermediate'
            },
            '지수함수': {
                aliases: ['exponential function'],
                related: ['로그함수', '자연로그', '지수법칙'],
                subconcepts: ['자연지수함수', '복리계산'],
                level: 'intermediate'
            },
            '로그함수': {
                aliases: ['logarithmic function', 'log'],
                related: ['지수함수', '자연로그', '로그법칙'],
                subconcepts: ['자연로그', '상용로그'],
                level: 'intermediate'
            },
            '수열': {
                aliases: ['sequence', 'series'],
                related: ['급수', '수렴', '발산', '등차수열', '등비수열'],
                subconcepts: ['등차수열', '등비수열', '피보나치수열'],
                level: 'intermediate'
            },
            '급수': {
                aliases: ['series', 'infinite series'],
                related: ['수열', '수렴', '발산', '합'],
                subconcepts: ['기하급수', '조화급수', '테일러급수'],
                level: 'advanced'
            },
            '확률': {
                aliases: ['probability'],
                related: ['통계', '사건', '확률분포'],
                subconcepts: ['조건부확률', '독립사건', '베이즈정리'],
                level: 'intermediate'
            },
            '통계': {
                aliases: ['statistics'],
                related: ['확률', '평균', '분산', '표준편차'],
                subconcepts: ['기술통계', '추론통계', '회귀분석'],
                level: 'intermediate'
            },
            '벡터': {
                aliases: ['vector'],
                related: ['스칼라', '내적', '외적', '공간'],
                subconcepts: ['단위벡터', '영벡터', '벡터공간'],
                level: 'advanced'
            },
            '행렬': {
                aliases: ['matrix'],
                related: ['행렬식', '역행렬', '선형변환'],
                subconcepts: ['정사각행렬', '대각행렬', '단위행렬'],
                level: 'advanced'
            },
            '기하': {
                aliases: ['geometry'],
                related: ['도형', '면적', '부피', '공간'],
                subconcepts: ['평면기하', '공간기하', '해석기하'],
                level: 'basic'
            },
            '방정식': {
                aliases: ['equation'],
                related: ['부등식', '해', '근', '이차방정식'],
                subconcepts: ['일차방정식', '이차방정식', '연립방정식'],
                level: 'basic'
            },
            '부등식': {
                aliases: ['inequality'],
                related: ['방정식', '해', '구간'],
                subconcepts: ['일차부등식', '이차부등식', '절댓값부등식'],
                level: 'basic'
            }
        };
    }

    /**
     * Builds keyword mapping for text analysis
     * @returns {Object} Keyword to concept mapping
     */
    buildKeywordMap() {
        return {
            // Korean keywords
            '미분': { concept: '미분', weight: 1.0 },
            '도함수': { concept: '미분', weight: 0.9 },
            '미분계수': { concept: '미분', weight: 0.8 },
            '적분': { concept: '적분', weight: 1.0 },
            '부정적분': { concept: '적분', weight: 0.9 },
            '정적분': { concept: '적분', weight: 0.9 },
            '극한': { concept: '극한', weight: 1.0 },
            '함수': { concept: '함수', weight: 0.7 },
            '삼각함수': { concept: '삼각함수', weight: 1.0 },
            '사인': { concept: '삼각함수', weight: 0.8 },
            '코사인': { concept: '삼각함수', weight: 0.8 },
            '탄젠트': { concept: '삼각함수', weight: 0.8 },
            '지수함수': { concept: '지수함수', weight: 1.0 },
            '로그함수': { concept: '로그함수', weight: 1.0 },
            '로그': { concept: '로그함수', weight: 0.8 },
            '수열': { concept: '수열', weight: 1.0 },
            '급수': { concept: '급수', weight: 1.0 },
            '확률': { concept: '확률', weight: 1.0 },
            '통계': { concept: '통계', weight: 1.0 },
            '벡터': { concept: '벡터', weight: 1.0 },
            '행렬': { concept: '행렬', weight: 1.0 },
            '기하': { concept: '기하', weight: 1.0 },
            '방정식': { concept: '방정식', weight: 1.0 },
            '부등식': { concept: '부등식', weight: 1.0 },
            '이차함수': { concept: '함수', weight: 0.9 },
            '유리함수': { concept: '함수', weight: 0.9 },
            '무리함수': { concept: '함수', weight: 0.9 },
            '합성함수': { concept: '함수', weight: 0.8 },
            '역함수': { concept: '함수', weight: 0.8 },
            '연속': { concept: '극한', weight: 0.7 },
            '수렴': { concept: '급수', weight: 0.8 },
            '발산': { concept: '급수', weight: 0.8 },
            '접선': { concept: '미분', weight: 0.7 },
            '면적': { concept: '적분', weight: 0.7 },
            '부피': { concept: '적분', weight: 0.7 },
            '곡선': { concept: '적분', weight: 0.6 },
            '각도': { concept: '삼각함수', weight: 0.6 },
            '단위원': { concept: '삼각함수', weight: 0.7 },
            '주기': { concept: '삼각함수', weight: 0.6 },
            '자연로그': { concept: '로그함수', weight: 0.8 },
            '상용로그': { concept: '로그함수', weight: 0.8 },
            '등차수열': { concept: '수열', weight: 0.9 },
            '등비수열': { concept: '수열', weight: 0.9 },
            '기하급수': { concept: '급수', weight: 0.9 },
            '조화급수': { concept: '급수', weight: 0.9 },
            '조건부확률': { concept: '확률', weight: 0.9 },
            '독립사건': { concept: '확률', weight: 0.8 },
            '평균': { concept: '통계', weight: 0.7 },
            '분산': { concept: '통계', weight: 0.7 },
            '표준편차': { concept: '통계', weight: 0.7 },
            '내적': { concept: '벡터', weight: 0.8 },
            '외적': { concept: '벡터', weight: 0.8 },
            '행렬식': { concept: '행렬', weight: 0.8 },
            '역행렬': { concept: '행렬', weight: 0.8 },
            '도형': { concept: '기하', weight: 0.7 },
            '해': { concept: '방정식', weight: 0.7 },
            '근': { concept: '방정식', weight: 0.7 },
            '이차방정식': { concept: '방정식', weight: 0.9 },
            '일차방정식': { concept: '방정식', weight: 0.9 },
            '연립방정식': { concept: '방정식', weight: 0.9 },
            '일차부등식': { concept: '부등식', weight: 0.9 },
            '이차부등식': { concept: '부등식', weight: 0.9 },
            '절댓값': { concept: '부등식', weight: 0.6 },

            // English keywords
            'derivative': { concept: '미분', weight: 1.0 },
            'differentiation': { concept: '미분', weight: 0.9 },
            'integral': { concept: '적분', weight: 1.0 },
            'integration': { concept: '적분', weight: 0.9 },
            'limit': { concept: '극한', weight: 1.0 },
            'function': { concept: '함수', weight: 0.7 },
            'trigonometric': { concept: '삼각함수', weight: 1.0 },
            'trigonometry': { concept: '삼각함수', weight: 0.9 },
            'sine': { concept: '삼각함수', weight: 0.8 },
            'cosine': { concept: '삼각함수', weight: 0.8 },
            'tangent': { concept: '삼각함수', weight: 0.8 },
            'exponential': { concept: '지수함수', weight: 1.0 },
            'logarithmic': { concept: '로그함수', weight: 1.0 },
            'logarithm': { concept: '로그함수', weight: 0.8 },
            'sequence': { concept: '수열', weight: 1.0 },
            'series': { concept: '급수', weight: 1.0 },
            'probability': { concept: '확률', weight: 1.0 },
            'statistics': { concept: '통계', weight: 1.0 },
            'vector': { concept: '벡터', weight: 1.0 },
            'matrix': { concept: '행렬', weight: 1.0 },
            'geometry': { concept: '기하', weight: 1.0 },
            'equation': { concept: '방정식', weight: 1.0 },
            'inequality': { concept: '부등식', weight: 1.0 },
            'quadratic': { concept: '방정식', weight: 0.8 },
            'linear': { concept: '방정식', weight: 0.7 },
            'continuous': { concept: '극한', weight: 0.7 },
            'convergence': { concept: '급수', weight: 0.8 },
            'divergence': { concept: '급수', weight: 0.8 },
            'tangent': { concept: '미분', weight: 0.7 },
            'area': { concept: '적분', weight: 0.7 },
            'volume': { concept: '적분', weight: 0.7 },
            'curve': { concept: '적분', weight: 0.6 },
            'angle': { concept: '삼각함수', weight: 0.6 },
            'unit circle': { concept: '삼각함수', weight: 0.7 },
            'periodic': { concept: '삼각함수', weight: 0.6 },
            'natural log': { concept: '로그함수', weight: 0.8 },
            'common log': { concept: '로그함수', weight: 0.8 },
            'arithmetic sequence': { concept: '수열', weight: 0.9 },
            'geometric sequence': { concept: '수열', weight: 0.9 },
            'geometric series': { concept: '급수', weight: 0.9 },
            'harmonic series': { concept: '급수', weight: 0.9 },
            'conditional probability': { concept: '확률', weight: 0.9 },
            'independent events': { concept: '확률', weight: 0.8 },
            'mean': { concept: '통계', weight: 0.7 },
            'variance': { concept: '통계', weight: 0.7 },
            'standard deviation': { concept: '통계', weight: 0.7 },
            'dot product': { concept: '벡터', weight: 0.8 },
            'cross product': { concept: '벡터', weight: 0.8 },
            'determinant': { concept: '행렬', weight: 0.8 },
            'inverse matrix': { concept: '행렬', weight: 0.8 },
            'shape': { concept: '기하', weight: 0.7 },
            'solution': { concept: '방정식', weight: 0.7 },
            'root': { concept: '방정식', weight: 0.7 },
            'quadratic equation': { concept: '방정식', weight: 0.9 },
            'linear equation': { concept: '방정식', weight: 0.9 },
            'system of equations': { concept: '방정식', weight: 0.9 },
            'linear inequality': { concept: '부등식', weight: 0.9 },
            'quadratic inequality': { concept: '부등식', weight: 0.9 },
            'absolute value': { concept: '부등식', weight: 0.6 }
        };
    }

    /**
     * Builds LaTeX pattern matching for concept detection
     * @returns {Object} LaTeX patterns to concepts mapping
     */
    buildLatexPatterns() {
        return {
            // Differentiation patterns
            '\\frac{d}{dx}': { concept: '미분', weight: 1.0 },
            '\\frac{d}{dy}': { concept: '미분', weight: 1.0 },
            '\\frac{d}{dt}': { concept: '미분', weight: 1.0 },
            '\\frac{d}{dz}': { concept: '미분', weight: 1.0 },
            '\\frac{d^2}{dx^2}': { concept: '미분', weight: 1.0 },
            '\\frac{d^2}{dy^2}': { concept: '미분', weight: 1.0 },
            '\\frac{d^n}{dx^n}': { concept: '미분', weight: 1.0 },
            'f\'(x)': { concept: '미분', weight: 0.9 },
            'f\'\'(x)': { concept: '미분', weight: 0.9 },
            'f^{(n)}(x)': { concept: '미분', weight: 0.9 },

            // Integration patterns
            '\\int': { concept: '적분', weight: 1.0 },
            '\\int_a^b': { concept: '적분', weight: 1.0 },
            '\\int_0^\\infty': { concept: '적분', weight: 1.0 },
            '\\int_{-\\infty}^{\\infty}': { concept: '적분', weight: 1.0 },
            '\\iint': { concept: '적분', weight: 1.0 },
            '\\iiint': { concept: '적분', weight: 1.0 },
            '\\oint': { concept: '적분', weight: 1.0 },

            // Limit patterns
            '\\lim': { concept: '극한', weight: 1.0 },
            '\\lim_{x \\to a}': { concept: '극한', weight: 1.0 },
            '\\lim_{x \\to \\infty}': { concept: '극한', weight: 1.0 },
            '\\lim_{x \\to 0}': { concept: '극한', weight: 1.0 },
            '\\lim_{n \\to \\infty}': { concept: '극한', weight: 1.0 },

            // Trigonometric patterns
            '\\sin': { concept: '삼각함수', weight: 0.8 },
            '\\cos': { concept: '삼각함수', weight: 0.8 },
            '\\tan': { concept: '삼각함수', weight: 0.8 },
            '\\csc': { concept: '삼각함수', weight: 0.8 },
            '\\sec': { concept: '삼각함수', weight: 0.8 },
            '\\cot': { concept: '삼각함수', weight: 0.8 },
            '\\arcsin': { concept: '삼각함수', weight: 0.8 },
            '\\arccos': { concept: '삼각함수', weight: 0.8 },
            '\\arctan': { concept: '삼각함수', weight: 0.8 },

            // Logarithmic patterns
            '\\log': { concept: '로그함수', weight: 0.8 },
            '\\ln': { concept: '로그함수', weight: 0.8 },
            '\\log_{10}': { concept: '로그함수', weight: 0.8 },
            '\\log_2': { concept: '로그함수', weight: 0.8 },

            // Exponential patterns
            'e^x': { concept: '지수함수', weight: 0.8 },
            'e^{': { concept: '지수함수', weight: 0.8 },
            'a^x': { concept: '지수함수', weight: 0.8 },
            '\\exp': { concept: '지수함수', weight: 0.8 },

            // Series patterns
            '\\sum': { concept: '급수', weight: 1.0 },
            '\\sum_{n=1}^{\\infty}': { concept: '급수', weight: 1.0 },
            '\\sum_{k=1}^{n}': { concept: '급수', weight: 1.0 },
            '\\prod': { concept: '급수', weight: 0.8 },

            // Vector patterns
            '\\vec': { concept: '벡터', weight: 1.0 },
            '\\overrightarrow': { concept: '벡터', weight: 1.0 },
            '\\mathbf': { concept: '벡터', weight: 0.7 },

            // Matrix patterns
            '\\begin{pmatrix}': { concept: '행렬', weight: 1.0 },
            '\\begin{bmatrix}': { concept: '행렬', weight: 1.0 },
            '\\begin{vmatrix}': { concept: '행렬', weight: 1.0 },
            '\\begin{matrix}': { concept: '행렬', weight: 1.0 },

            // Function patterns
            'f(x)': { concept: '함수', weight: 0.7 },
            'g(x)': { concept: '함수', weight: 0.7 },
            'h(x)': { concept: '함수', weight: 0.7 },
            'y =': { concept: '함수', weight: 0.6 },

            // Fraction patterns
            '\\frac': { concept: '분수', weight: 0.5 },

            // Root patterns
            '\\sqrt': { concept: '제곱근', weight: 0.5 },
            '\\sqrt[n]': { concept: '제곱근', weight: 0.5 }
        };
    }

    /**
     * Extracts concepts from LaTeX expressions
     * @param {string} latex - LaTeX string
     * @returns {Array} Array of concept objects with confidence scores
     */
    extractFromLatex(latex) {
        const concepts = [];
        const foundPatterns = new Set();

        // Check for LaTeX patterns
        for (const [pattern, mapping] of Object.entries(this.latexPatterns)) {
            if (latex.includes(pattern)) {
                concepts.push({
                    concept: mapping.concept,
                    confidence: mapping.weight,
                    source: 'latex_pattern',
                    pattern: pattern
                });
                foundPatterns.add(mapping.concept);
            }
        }

        // Check for LaTeX commands
        const latexCommands = latex.match(/\\[a-zA-Z]+/g) || [];
        for (const command of latexCommands) {
            if (this.latexPatterns[command]) {
                const mapping = this.latexPatterns[command];
                if (!foundPatterns.has(mapping.concept)) {
                    concepts.push({
                        concept: mapping.concept,
                        confidence: mapping.weight * 0.8, // Slightly lower for individual commands
                        source: 'latex_command',
                        command: command
                    });
                }
            }
        }

        return concepts;
    }

    /**
     * Extracts concepts from natural language text
     * @param {string} text - Natural language text
     * @returns {Array} Array of concept objects with confidence scores
     */
    extractFromText(text) {
        const concepts = [];
        const words = text.toLowerCase().split(/\s+/);
        const foundConcepts = new Set();

        // Check for exact keyword matches
        for (const [keyword, mapping] of Object.entries(this.keywordMap)) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
                if (!foundConcepts.has(mapping.concept)) {
                    concepts.push({
                        concept: mapping.concept,
                        confidence: mapping.weight,
                        source: 'keyword_match',
                        keyword: keyword
                    });
                    foundConcepts.add(mapping.concept);
                }
            }
        }

        // Check for partial matches in words
        for (const word of words) {
            for (const [keyword, mapping] of Object.entries(this.keywordMap)) {
                if (word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)) {
                    if (!foundConcepts.has(mapping.concept)) {
                        concepts.push({
                            concept: mapping.concept,
                            confidence: mapping.weight * 0.7, // Lower confidence for partial matches
                            source: 'partial_match',
                            word: word,
                            keyword: keyword
                        });
                        foundConcepts.add(mapping.concept);
                    }
                }
            }
        }

        return concepts;
    }

    /**
     * Extracts concepts from pattern analysis
     * @param {string} latex - LaTeX string
     * @param {string} text - Natural language text
     * @returns {Array} Array of concept objects with confidence scores
     */
    extractFromPatterns(latex, text) {
        const concepts = [];
        const combinedText = `${latex} ${text}`.toLowerCase();

        // Check for mathematical context patterns
        const contextPatterns = {
            '미분하시오': { concept: '미분', weight: 0.9 },
            'differentiate': { concept: '미분', weight: 0.9 },
            '적분하시오': { concept: '적분', weight: 0.9 },
            'integrate': { concept: '적분', weight: 0.9 },
            '극한값': { concept: '극한', weight: 0.9 },
            'limit': { concept: '극한', weight: 0.9 },
            '함수의': { concept: '함수', weight: 0.8 },
            'function': { concept: '함수', weight: 0.8 },
            '삼각함수의': { concept: '삼각함수', weight: 0.9 },
            'trigonometric': { concept: '삼각함수', weight: 0.9 },
            '로그함수의': { concept: '로그함수', weight: 0.9 },
            'logarithmic': { concept: '로그함수', weight: 0.9 },
            '지수함수의': { concept: '지수함수', weight: 0.9 },
            'exponential': { concept: '지수함수', weight: 0.9 },
            '수열의': { concept: '수열', weight: 0.9 },
            'sequence': { concept: '수열', weight: 0.9 },
            '급수의': { concept: '급수', weight: 0.9 },
            'series': { concept: '급수', weight: 0.9 },
            '확률의': { concept: '확률', weight: 0.9 },
            'probability': { concept: '확률', weight: 0.9 },
            '통계의': { concept: '통계', weight: 0.9 },
            'statistics': { concept: '통계', weight: 0.9 },
            '벡터의': { concept: '벡터', weight: 0.9 },
            'vector': { concept: '벡터', weight: 0.9 },
            '행렬의': { concept: '행렬', weight: 0.9 },
            'matrix': { concept: '행렬', weight: 0.9 },
            '방정식의': { concept: '방정식', weight: 0.9 },
            'equation': { concept: '방정식', weight: 0.9 },
            '부등식의': { concept: '부등식', weight: 0.9 },
            'inequality': { concept: '부등식', weight: 0.9 }
        };

        for (const [pattern, mapping] of Object.entries(contextPatterns)) {
            if (combinedText.includes(pattern.toLowerCase())) {
                concepts.push({
                    concept: mapping.concept,
                    confidence: mapping.weight,
                    source: 'context_pattern',
                    pattern: pattern
                });
            }
        }

        return concepts;
    }

    /**
     * Merges concepts from different sources and removes duplicates
     * @param {Array} latexConcepts - Concepts from LaTeX analysis
     * @param {Array} textConcepts - Concepts from text analysis
     * @param {Array} patternConcepts - Concepts from pattern analysis
     * @returns {Array} Merged and deduplicated concepts
     */
    mergeConcepts(latexConcepts, textConcepts, patternConcepts) {
        const conceptMap = new Map();

        // Helper function to add concept to map
        const addConcept = (conceptObj) => {
            const { concept, confidence, source, ...details } = conceptObj;
            
            if (conceptMap.has(concept)) {
                // If concept already exists, take the higher confidence
                const existing = conceptMap.get(concept);
                if (confidence > existing.confidence) {
                    conceptMap.set(concept, {
                        concept,
                        confidence,
                        source,
                        ...details,
                        sources: [...existing.sources, source]
                    });
                } else {
                    // Add source to existing concept
                    existing.sources.push(source);
                }
            } else {
                conceptMap.set(concept, {
                    concept,
                    confidence,
                    source,
                    ...details,
                    sources: [source]
                });
            }
        };

        // Add all concepts
        [...latexConcepts, ...textConcepts, ...patternConcepts].forEach(addConcept);

        return Array.from(conceptMap.values());
    }

    /**
     * Ranks concepts by confidence and relevance
     * @param {Array} concepts - Array of concept objects
     * @param {string} latex - LaTeX string for context
     * @param {string} text - Text string for context
     * @returns {Array} Ranked concepts
     */
    rankConcepts(concepts, latex, text) {
        return concepts
            .map(concept => {
                // Boost confidence based on concept graph relationships
                let boostedConfidence = concept.confidence;
                
                // Check if concept has related concepts that are also detected
                if (this.conceptGraph[concept.concept]) {
                    const relatedConcepts = this.conceptGraph[concept.concept].related;
                    const detectedRelated = concepts.filter(c => 
                        relatedConcepts.includes(c.concept)
                    ).length;
                    
                    // Boost confidence if related concepts are also detected
                    if (detectedRelated > 0) {
                        boostedConfidence += 0.1 * detectedRelated;
                    }
                }

                // Boost confidence for concepts with multiple sources
                if (concept.sources && concept.sources.length > 1) {
                    boostedConfidence += 0.1 * (concept.sources.length - 1);
                }

                // Cap confidence at 1.0
                boostedConfidence = Math.min(boostedConfidence, 1.0);

                return {
                    ...concept,
                    confidence: boostedConfidence
                };
            })
            .sort((a, b) => b.confidence - a.confidence) // Sort by confidence descending
            .filter(concept => concept.confidence >= 0.3); // Filter out low confidence concepts
    }

    /**
     * Calculates overall confidence score
     * @param {Array} rankedConcepts - Ranked concept array
     * @returns {number} Overall confidence score (0-1)
     */
    calculateOverallConfidence(rankedConcepts) {
        if (rankedConcepts.length === 0) return 0;
        
        const totalConfidence = rankedConcepts.reduce((sum, concept) => sum + concept.confidence, 0);
        const averageConfidence = totalConfidence / rankedConcepts.length;
        
        // Boost confidence if multiple concepts are detected
        const conceptCountBonus = Math.min(rankedConcepts.length * 0.1, 0.3);
        
        return Math.min(averageConfidence + conceptCountBonus, 1.0);
    }

    /**
     * Gets related concepts for a given concept
     * @param {string} concept - Concept name
     * @returns {Array} Array of related concepts
     */
    getRelatedConcepts(concept) {
        if (this.conceptGraph[concept]) {
            return this.conceptGraph[concept].related || [];
        }
        return [];
    }

    /**
     * Gets subconcepts for a given concept
     * @param {string} concept - Concept name
     * @returns {Array} Array of subconcepts
     */
    getSubconcepts(concept) {
        if (this.conceptGraph[concept]) {
            return this.conceptGraph[concept].subconcepts || [];
        }
        return [];
    }

    /**
     * Gets concept level (basic, intermediate, advanced)
     * @param {string} concept - Concept name
     * @returns {string} Concept level
     */
    getConceptLevel(concept) {
        if (this.conceptGraph[concept]) {
            return this.conceptGraph[concept].level || 'unknown';
        }
        return 'unknown';
    }
}

// Main function to map OCR output to concepts
function mapOCRToConcepts(ocrOutput) {
    const mapper = new ConceptMapper();
    return mapper.mapToConcepts(ocrOutput);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ConceptMapper,
        mapOCRToConcepts
    };
}
