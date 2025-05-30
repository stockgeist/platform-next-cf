type SeparatorWithTextProps = {
  leftBorderProps?: React.HTMLAttributes<HTMLDivElement>
  rightBorderProps?: React.HTMLAttributes<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>

export default function SeparatorWithText({
  children,
  leftBorderProps,
  rightBorderProps,
  ...props
}: SeparatorWithTextProps) {
  return (
    <div className="relative flex items-center" {...props}>
      <div
        className="border-foreground-muted flex-grow border-t"
        {...leftBorderProps}
      ></div>
      <span className="mx-4 flex-shrink">{children}</span>
      <div
        className="border-foreground-muted flex-grow border-t"
        {...rightBorderProps}
      ></div>
    </div>
  )
}
