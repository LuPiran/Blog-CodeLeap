function extractTagsAndMentions(text, explicitTags) {
  const tagRegex = /#([\p{L}\p{N}_]+)/gu;
  const mentionRegex = /@([\p{L}\p{N}_]+)/gu;

  const tagsFromText = [];
  const mentionsFromText = [];

  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    tagsFromText.push(match[1]);
  }

  while ((match = mentionRegex.exec(text)) !== null) {
    mentionsFromText.push(match[1]);
  }

  const parsedTags = Array.from(
    new Set([...(explicitTags || []), ...tagsFromText]),
  );

  return {
    parsedTags,
    mentions: Array.from(new Set(mentionsFromText)),
  };
}

module.exports = {
  extractTagsAndMentions,
};

