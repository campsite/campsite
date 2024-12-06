export const MULTI_VALUE_PICKER_STYLES = {
  container: (provided: any, state: any) => ({
    ...provided,
    background: 'var(--bg-react-select)',
    boxShadow: state.isFocused || state.isSelected ? 'var(--tag-focus)' : ''
  }),
  control: () => {
    return {
      padding: '2px',
      borderRadius: 6,
      caretColor: 'var(--text-primary)'
    }
  },
  valueContainer: (provided: any) => ({
    ...provided,
    padding: 0,
    width: '100%',
    gap: 2,
    opacity: 1,
    overflow: 'visible'
  }),
  placeholder: (provided: any) => ({
    ...provided,
    fontSize: 14,
    paddingLeft: 4,
    color: '#A3A3A3'
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    color: 'var(--text-primary)',
    padding: '6px 8px',
    fontSize: 14,
    borderRadius: 6,
    backgroundColor: state.isFocused || state.isSelected ? 'var(--bg-quaternary)' : '',
    '&:hover': {
      cursor: 'pointer',
      background: 'var(--bg-quaternary)'
    }
  }),
  multiValue: (provided: any) => {
    return {
      ...provided,
      borderRadius: 4,
      minWidth: 'auto',
      padding: '2px 6px',
      background: 'var(--tag-bg)',
      display: 'flex',
      alignItems: 'center',
      margin: 0,
      fontSize: 16,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  },
  multiValueLabel: (provided: any) => ({
    ...provided,
    fontSize: 14,
    padding: 2,
    paddingLeft: 4,
    paddingRight: 6,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--text-primary)'
  }),
  multiValueRemove: () => ({
    display: 'none'
  }),
  input: (provided: any) => ({
    ...provided,
    outline: 'none',
    boxShadow: 0,
    fontSize: 13,
    color: 'var(--text-primary)',
    padding: 2
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    right: 0,
    top: 0
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    display: 'none'
  }),
  clearIndicator: (provided: any) => ({
    ...provided,
    display: 'none'
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    display: 'none'
  }),
  menu: (provided: any) => ({
    ...provided,
    padding: '0 4px',
    marginTop: '4px',
    marginLeft: '-2px',
    width: 'calc(100% + 4px)',
    borderRadius: 6,
    overflow: 'hidden',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-primary)',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    zIndex: 10
  }),
  noOptionsMessage: (provided: any) => ({
    ...provided,
    fontSize: 13
  }),
  loadingMessage: (provided: any) => ({
    ...provided,
    fontSize: 13
  })
}
