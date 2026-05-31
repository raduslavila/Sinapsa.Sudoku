interface Props {
    count: number;
    limit: number | null;
}

export function MistakeCounter({ count, limit }: Props) {
    const label =
        limit !== null
            ? `Mistakes: ${count} of ${limit}`
            : `Mistakes: ${count}`;

    return (
        <span
            aria-label={label}
            role="status"
            style={{
                fontSize: 15,
                fontWeight: 500,
                color: count > 0 ? 'var(--color-wrong)' : 'var(--color-given)',
            }}
        >
            {limit !== null ? `${count}/${limit}` : count > 0 ? `${count} ✗` : ''}
        </span>
    );
}
