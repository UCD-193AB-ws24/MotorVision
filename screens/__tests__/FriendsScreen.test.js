describe('handleSendRequest', () => {
  let emailInput;
  let setEmailInput;
  let setModalVisible;
  let sendRequest;
  let Alert;

  // Injected version of handleSendRequest for testing
  const createHandleSendRequest = () => {
    return async () => {
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
  };

  beforeEach(() => {
    emailInput = '';
    setEmailInput = jest.fn();
    setModalVisible = jest.fn();
    sendRequest = jest.fn();
    Alert = { alert: jest.fn() };
  });

  it('alerts when email is empty', async () => {
    const handleSendRequest = createHandleSendRequest();
    await handleSendRequest();
    expect(Alert.alert).toHaveBeenCalledWith('Invalid', 'Please enter an email.');
  });

  it('calls sendRequest and resets state on valid email', async () => {
    emailInput = '   USER@example.com ';
    sendRequest.mockResolvedValueOnce();

    const handleSendRequest = createHandleSendRequest();
    await handleSendRequest();

    expect(sendRequest).toHaveBeenCalledWith('user@example.com');
    expect(setEmailInput).toHaveBeenCalledWith('');
    expect(setModalVisible).toHaveBeenCalledWith(false);
  });

  it('alerts on sendRequest failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    emailInput = 'test@example.com';
    sendRequest.mockRejectedValueOnce(new Error('fail'));

    const handleSendRequest = createHandleSendRequest();
    await handleSendRequest();

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Could not send request.');
    expect(consoleSpy).toHaveBeenCalledWith(
        'Friend request error:',
        expect.any(Error)
    );

    consoleSpy.mockRestore();
    });

});

describe('confirmRemoveFriend', () => {
  let Alert;
  let removeFriend;

  // Injected version for testing
  const createConfirmRemoveFriend = () => {
    return (email) => {
      Alert.alert('Remove Friend', `Are you sure you want to remove ${email}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFriend(email) },
      ]);
    };
  };

  beforeEach(() => {
    Alert = { alert: jest.fn() };
    removeFriend = jest.fn();
  });

  it('shows confirmation alert with correct options', () => {
    const email = 'friend@example.com';
    const confirmRemoveFriend = createConfirmRemoveFriend();
    confirmRemoveFriend(email);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Remove Friend',
      `Are you sure you want to remove ${email}?`,
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
        expect.objectContaining({ text: 'Remove', style: 'destructive' }),
      ])
    );
  });

  it('calls removeFriend on "Remove" press', () => {
    const email = 'friend@example.com';
    const confirmRemoveFriend = createConfirmRemoveFriend();
    confirmRemoveFriend(email);

    // Simulate pressing the "Remove" button
    const buttons = Alert.alert.mock.calls[0][2];
    const removeButton = buttons.find(b => b.text === 'Remove');
    removeButton.onPress();

    expect(removeFriend).toHaveBeenCalledWith(email);
  });
});
