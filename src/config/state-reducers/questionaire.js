export default function questionaireReducer(state, action) {
  switch (action.type) {
    case "ADD_NEW_SECTION": {
      const existingNames = Object.values(state.sections).map((sec) => sec.name)
      let count = 1
      let newSectionName = `Untitled Section ${count}`
      while (existingNames.includes(newSectionName)) {
        count++;
        newSectionName = `Untitled Section ${count}`;
      }
      const newSectionKey = `section-${Date.now()}`;
      return {
        ...state,
        sections: {
          ...state.sections,
          [newSectionKey]: {
            sectionId: newSectionKey,
            name: newSectionName,
            questions: [],
          },
        },
      }
    }
    case "REMOVE_SECTION": {
      delete state.sections[action.payload]
      return {
        ...state
      };
    }
    case "SAVE_SECTION": {
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.payload.sectionKey]: action.payload.values
        }
      }
    }
    case "ADD_NEW_QUESTION_SECTION": {
      return ({
        ...state,
        sections: {
          ...state.sections,
          [action.payload]: {
            ...state.sections[action.payload],
            questions: [...state.sections[action.payload].questions,
            {
              id: `Q${Date.now()}`,
              name: `Question ${state.sections[action.payload].questions.length + 1}`,
              type: "shortAnswer",
              text: "",
              options: [],
              optionToSectionMap: {},
              hierarchyType: "normal",
              hierarchy: "normal",
              isMandatory: false,
              minScale: null,
              maxScale: null,
              label1: null,
              label2: null,
              dateTime: null,
              imagePath: null,
              filePath: null,
              answerText: null,
              answer: null
            }
            ]
          }
        }
      })
    }
    case "REMOVE_QUESTION":
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.payload.sectionKey]: {
            ...state.sections[action.payload.sectionKey],
            questions: state.sections[action.payload.sectionKey].questions.filter((_, index) => index !== action.payload.index)
          }
        }
      }
    case "UPDATE_QUESTION": {
      const { sectionKey, questionIndex, questionData } = action.payload;
      return {
        ...state,
        sections: {
          ...state.sections,
          [sectionKey]: {
            ...state.sections[sectionKey],
            questions: state.sections[sectionKey].questions.map((question, index) =>
              index === questionIndex ? { ...question, ...questionData } : question
            )
          }
        }
      }
    }
    case "ADD_NESTED_SECTION": {
      const { optionText, parentSectionKey, questionIndex } = action.payload;
      const existingNames = Object.values(state.sections).map((sec) => sec.name)
      let count = 1
      let newSectionName = `Nested Section ${count}`
      while (existingNames.includes(newSectionName)) {
        count++;
        newSectionName = `Nested Section ${count}`;
      }
      const newSectionKey = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create new nested section
      const newSection = {
        sectionId: newSectionKey,
        name: newSectionName,
        questions: [],
        isNested: true,
      };

      // Update the parent question with the option to section mapping
      const updatedSections = {
        ...state.sections,
        [newSectionKey]: newSection,
        [parentSectionKey]: {
          ...state.sections[parentSectionKey],
          questions: state.sections[parentSectionKey].questions.map((question, index) => {
            if (index === questionIndex) {
              return {
                ...question,
                hierarchyType: "nested",
                optionToSectionMap: {
                  ...(question.optionToSectionMap || {}),
                  [optionText]: newSectionKey
                }
              };
            }
            return question;
          })
        }
      };

      return {
        ...state,
        sections: updatedSections
      };
    }
    case "REMOVE_NESTED_SECTION": {
      const { sectionKey, parentSectionKey, questionIndex, optionText } = action.payload;
      const newSections = { ...state.sections };

      // Remove the nested section
      delete newSections[sectionKey];

      // Update parent question to remove the mapping
      if (parentSectionKey && questionIndex !== undefined) {
        newSections[parentSectionKey] = {
          ...newSections[parentSectionKey],
          questions: newSections[parentSectionKey].questions.map((question, index) => {
            if (index === questionIndex) {
              const newOptionToSectionMap = { ...(question.optionToSectionMap || {}) };
              delete newOptionToSectionMap[optionText];

              return {
                ...question,
                optionToSectionMap: newOptionToSectionMap,
                hierarchyType: Object.keys(newOptionToSectionMap).length > 0 ? "nested" : "normal"
              };
            }
            return question;
          })
        };
      }

      return {
        ...state,
        sections: newSections
      };
    }
    case "UPDATE_OPTION_REDIRECT": {
      const { sectionKey, questionIndex, optionText, targetSectionKey } = action.payload;
      return {
        ...state,
        sections: {
          ...state.sections,
          [sectionKey]: {
            ...state.sections[sectionKey],
            questions: state.sections[sectionKey].questions.map((question, index) => {
              if (index === questionIndex) {
                const newOptionToSectionMap = {
                  ...(question.optionToSectionMap || {}),
                  [optionText]: targetSectionKey
                };
                return {
                  ...question,
                  optionToSectionMap: newOptionToSectionMap,
                  hierarchyType: "nested"
                };
              }
              return question;
            })
          }
        }
      };
    }
    default:
      return {
        ...state
      };
  }
}

export function newSection() {
  return {
    type: "ADD_NEW_SECTION"
  }
}

export function removeSection(payload) {
  return {
    type: "REMOVE_SECTION",
    payload
  }
}

export function saveSection(payload) {
  return {
    type: "SAVE_SECTION",
    payload
  }
}

export function addNewQuestionToSection(payload) {
  return {
    type: "ADD_NEW_QUESTION_SECTION",
    payload
  }
}

export function removeQuestion(payload) {
  return {
    type: "REMOVE_QUESTION",
    payload
  }
}

export function updateQuestion(payload) {
  return {
    type: "UPDATE_QUESTION",
    payload
  }
}

export function addNestedSection(payload) {
  return {
    type: "ADD_NESTED_SECTION",
    payload
  }
}

export function removeNestedSection(payload) {
  return {
    type: "REMOVE_NESTED_SECTION",
    payload
  }
}

export function updateOptionRedirect(payload) {
  return {
    type: "UPDATE_OPTION_REDIRECT",
    payload
  }
}

function nestedOptionsMap(options = []) {
  return options.reduce((acc, option) => {
    acc[option.text] = option.sectionId
    return acc
  }, {})
}

export function questionaireInitialState(sections = []) {
  const transformedSections = {}

  const nestedSections = new Set(
    sections
      .flatMap(section => section
        .questions
        .filter(question => Boolean(question.optionsWithRedirects))
        .flatMap(question => question
          .optionsWithRedirects
          .map(option => option.sectionId)
        )
      )
  )

  sections.forEach((section, sectionIndex) => {
    const sectionId = section.sectionId || section._id || `section-${Date.now() + sectionIndex}`
    const transformedQuestions = []

    section.questions.forEach((question, questionIndex) => {
      const questionId = `Q${Date.now() + questionIndex}`

      transformedQuestions.push({
        id: questionId,
        name: `Question ${questionIndex + 1}`,
        type: question.type || null,
        text: question.text || "",
        options: question.options || [],
        optionToSectionMap: nestedOptionsMap(question.optionsWithRedirects) || {},
        hierarchyType: question.hierarchyType || "normal",
        hierarchy: question.hierarchy || "normal",
        isMandatory: question.isMandatory ?? false,
        answer: null,
        answerText: null,
        dateTime: null,
        filePath: null,
        imagePath: null,
        minScale: null,
        maxScale: null,
        label1: null,
        label2: null,
        ...question,
      })
    })

    transformedSections[sectionId] = {
      sectionId: sectionId,
      name: section.name || `Untitled Section ${sectionIndex + 1}`,
      questions: transformedQuestions,
      isNested: nestedSections.has(section._id) || false,
    }
  })

  return {
    sections: transformedSections
  }
}

export function generateQuestionaireRP(data) {
  const sections = Object.values(data).map((section, sectionIndex) => {
    return {
      sectionId: section.sectionId || section._id || `section_${sectionIndex}`,
      name: section.name || `Section ${sectionIndex + 1}`,
      questions: section.questions.map((q) => {
        const questionData = {
          type: q.type || undefined,
          text: q.text || undefined,
          isMandatory: q.isMandatory ?? false,
          minScale: q.minScale ?? undefined,
          maxScale: q.maxScale ?? undefined,
          label1: q.label1 ?? undefined,
          label2: q.label2 ?? undefined
        };

        // Only include options array if it exists and has items
        if (q.options && q.options.length > 0) {
          questionData.options = q.options;
        }

        // Only include optionToSectionMap if it exists and has entries
        if (q.optionToSectionMap && Object.keys(q.optionToSectionMap).length > 0) {
          questionData.optionToSectionMap = q.optionToSectionMap;
        }

        return questionData;
      })
    }
  })

  return sections;
}