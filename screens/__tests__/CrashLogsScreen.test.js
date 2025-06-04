describe('Log Handlers', () => {
  const clearCrashLogs = jest.fn();
  const deleteCrashLog = jest.fn();

  const handleClearLogs = () => {
    clearCrashLogs();
  };

  const handleDeleteLog = (id) => {
    deleteCrashLog(id);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls clearCrashLogs directly', () => {
    handleClearLogs();
    expect(clearCrashLogs).toHaveBeenCalled();
  });

  it('calls deleteCrashLog with correct id directly', () => {
    handleDeleteLog('456');
    expect(deleteCrashLog).toHaveBeenCalledWith('456');
  });
});
