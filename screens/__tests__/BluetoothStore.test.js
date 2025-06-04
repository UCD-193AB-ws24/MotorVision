describe('handleSendRequest', () => {
  const Alert = { alert: jest.fn() };
  const setEmailInput = jest.fn();
  const setModalVisible = jest.fn();

  const createHandler = (sendRequest) => async (emailInput) => {
    const email = emailInput.trim().toLowerCase();
    if (!email) {
      Alert.alert('Invalid', 'Please enter an email.');
      return;
    }
    try {
      await sendRequest(email);
      setEmailInput('');
      setModalVisible(false);
    } catch (err) {
      console.error('Friend request error:', err);
      Alert.alert('Error', 'Could not send request.');
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows alert if email is empty', async () => {
    const handler = createHandler(jest.fn());
    await handler('   ');
    expect(Alert.alert).toHaveBeenCalledWith('Invalid', 'Please enter an email.');
  });

  test('sends request and resets fields on success', async () => {
    const mockSend = jest.fn().mockResolvedValueOnce();
    const handler = createHandler(mockSend);
    await handler('test@EXAMPLE.com');
    expect(mockSend).toHaveBeenCalledWith('test@example.com');
    expect(setEmailInput).toHaveBeenCalledWith('');
    expect(setModalVisible).toHaveBeenCalledWith(false);
  });

  test('shows error alert on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockSend = jest.fn().mockRejectedValueOnce(new Error('fail'));
    const handler = createHandler(mockSend);
    await handler('user@test.com');
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Could not send request.');
    consoleSpy.mockRestore();
    });

});

describe('confirmRemoveFriend', () => {
  const Alert = { alert: jest.fn() };
  const removeFriend = jest.fn();

  const confirmRemoveFriend = (email) => {
    Alert.alert('Remove Friend', `Are you sure you want to remove ${email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFriend(email) },
    ]);
  };

  test('shows confirmation alert with remove callback', () => {
    confirmRemoveFriend('user@example.com');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Remove Friend',
      'Are you sure you want to remove user@example.com?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({
          text: 'Remove',
          onPress: expect.any(Function),
        }),
      ])
    );

    // Simulate pressing "Remove"
    const buttons = Alert.alert.mock.calls[0][2];
    const removeButton = buttons.find((b) => b.text === 'Remove');
    removeButton.onPress();
    expect(removeFriend).toHaveBeenCalledWith('user@example.com');
  });
});
