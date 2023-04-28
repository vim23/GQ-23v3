export const formatDate = (date?: Date | null) => {
    if (!date) return null;

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    }).format(date);
};

export const formatDateSerial = (date?: Date | string | number | null) => {
    if (!date) return null;

    const d = new Date(date);
    const pad = (num: number, digits: number): string => ("0".repeat(digits) + num).slice(-digits);

    return [
        d.getUTCFullYear(),
        pad(d.getUTCMonth() + 1, 2),
        pad(d.getUTCDate(), 2),
        pad(d.getUTCHours(), 2),
        pad(d.getUTCMinutes(), 2),
        pad(d.getUTCSeconds(), 2),
    ].join("");
};
