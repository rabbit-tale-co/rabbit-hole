interface TypographyTableProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyTable({ children, className = "" }: TypographyTableProps) {
  return (
    <div className={`my-6 w-full overflow-y-auto ${className}`}>
      <table className="w-full">
        {children}
      </table>
    </div>
  )
}

// Helper components for table elements
interface TypographyTableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyTableHead({ children, className = "" }: TypographyTableHeadProps) {
  return (
    <thead className={className}>
      {children}
    </thead>
  )
}

interface TypographyTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyTableBody({ children, className = "" }: TypographyTableBodyProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  )
}

interface TypographyTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyTableRow({ children, className = "" }: TypographyTableRowProps) {
  return (
    <tr className={`even:bg-muted m-0 border-t p-0 ${className}`}>
      {children}
    </tr>
  )
}

interface TypographyTableHeaderProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TypographyTableHeader({ children, className = "", align = 'left' }: TypographyTableHeaderProps) {
  return (
    <th className={`border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right ${className}`} align={align}>
      {children}
    </th>
  )
}

interface TypographyTableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TypographyTableCell({ children, className = "", align = 'left' }: TypographyTableCellProps) {
  return (
    <td className={`border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right ${className}`} align={align}>
      {children}
    </td>
  )
}
