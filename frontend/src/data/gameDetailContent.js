export function mergeDetailItem(item) {
    if (!item) return null;

    const screenshots =
        Array.isArray(item.screenshots) && item.screenshots.length > 0
            ? item.screenshots
            : item.image
              ? [item.image]
              : [];

    return { ...item, screenshots };
}
