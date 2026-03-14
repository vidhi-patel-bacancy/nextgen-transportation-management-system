export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
