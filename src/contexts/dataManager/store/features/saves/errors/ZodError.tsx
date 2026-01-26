const ZodErrorEntry = ({ entry }: ZodErrorEntry.Props) => {
  return (
    <ul style={{ paddingLeft: "1em", margin: 0 }}>
      {entry.errors.map((err, idx) => (
        <li key={idx}>{err}</li>
      ))}
      {entry.properties &&
        Object.entries(entry.properties).map(([key, prop], idx) => (
          <li key={idx}>
            <strong>{key}:</strong>
            <ZodErrorEntry entry={prop} />
          </li>
        ))}
    </ul>
  );
};

namespace ZodErrorEntry {
  export interface Entry {
    errors: string[];
    properties?: Record<string, Entry>;
  }

  export interface Props {
    entry: Entry;
  }
}

export const ZodError = ({ error }: ZodError.Props) => {
  return <ZodErrorEntry entry={error.tree} />;
};
namespace ZodError {
  export interface Props {
    error: {
      type: "ZodError";
      tree: ZodErrorEntry.Entry;
    };
  }
}
