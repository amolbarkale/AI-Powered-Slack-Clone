import { 
  signUp, 
  signIn, 
  createWorkspace, 
  createChannel, 
  sendMessage, 
  getMessages, 
  uploadFile,
  getThreadMessages,
  markChannelAsRead,
  getUnreadCounts
} from '../lib/api';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User'
};

// Test data
const TEST_WORKSPACE = {
  name: 'Test Workspace',
  description: 'A workspace for testing'
};

const TEST_CHANNEL = {
  name: 'test-channel',
  description: 'A channel for testing'
};

const TEST_MESSAGE = {
  content: 'Hello, this is a test message!'
};

const TEST_REPLY = {
  content: 'This is a reply to the test message!'
};

// Helper function to create a test file
const createTestFile = () => {
  const content = 'This is a test file content.';
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], 'test.txt', { type: 'text/plain' });
};

// Main test function
const runTests = async () => {
  console.log('Starting Supabase integration tests...');
  
  try {
    // 1. Sign up a test user
    console.log('1. Testing user signup...');
    const { error: signUpError } = await signUp(
      TEST_USER.email,
      TEST_USER.password,
      { fullName: TEST_USER.fullName }
    );
    
    if (signUpError) {
      throw new Error(`Sign up failed: ${signUpError.message}`);
    }
    console.log('✅ User signup successful');
    
    // 2. Sign in with the test user
    console.log('2. Testing user signin...');
    const { data: signInData, error: signInError } = await signIn(
      TEST_USER.email,
      TEST_USER.password
    );
    
    if (signInError) {
      throw new Error(`Sign in failed: ${signInError.message}`);
    }
    console.log('✅ User signin successful');
    
    // 3. Create a workspace
    console.log('3. Testing workspace creation...');
    const { data: workspaceData, error: workspaceError } = await createWorkspace(
      TEST_WORKSPACE.name,
      TEST_WORKSPACE.description
    );
    
    if (workspaceError) {
      throw new Error(`Workspace creation failed: ${workspaceError.message}`);
    }
    console.log('✅ Workspace creation successful');
    
    // 4. Create a channel
    console.log('4. Testing channel creation...');
    const { data: channelData, error: channelError } = await createChannel(
      workspaceData.id,
      TEST_CHANNEL.name,
      TEST_CHANNEL.description
    );
    
    if (channelError) {
      throw new Error(`Channel creation failed: ${channelError.message}`);
    }
    console.log('✅ Channel creation successful');
    
    // 5. Send a message
    console.log('5. Testing message sending...');
    const { data: messageData, error: messageError } = await sendMessage(
      channelData.id,
      TEST_MESSAGE.content,
      null,
      workspaceData.id
    );
    
    if (messageError) {
      throw new Error(`Message sending failed: ${messageError.message}`);
    }
    console.log('✅ Message sending successful');
    
    // 6. Get messages
    console.log('6. Testing message retrieval...');
    const { data: messagesData, error: messagesError } = await getMessages(channelData.id);
    
    if (messagesError) {
      throw new Error(`Message retrieval failed: ${messagesError.message}`);
    }
    
    if (!messagesData.some(msg => msg.content === TEST_MESSAGE.content)) {
      throw new Error('Message retrieval failed: Test message not found');
    }
    console.log('✅ Message retrieval successful');
    
    // 7. Send a reply
    console.log('7. Testing thread reply...');
    const { error: replyError } = await sendMessage(
      channelData.id,
      TEST_REPLY.content,
      messageData.id,
      workspaceData.id
    );
    
    if (replyError) {
      throw new Error(`Thread reply failed: ${replyError.message}`);
    }
    console.log('✅ Thread reply successful');
    
    // 8. Get thread messages
    console.log('8. Testing thread messages retrieval...');
    const { data: threadData, error: threadError } = await getThreadMessages(messageData.id);
    
    if (threadError) {
      throw new Error(`Thread messages retrieval failed: ${threadError.message}`);
    }
    
    if (!threadData.some(msg => msg.content === TEST_REPLY.content)) {
      throw new Error('Thread messages retrieval failed: Reply not found');
    }
    console.log('✅ Thread messages retrieval successful');
    
    // 9. Upload a file with a message
    console.log('9. Testing file upload...');
    const testFile = createTestFile();
    const { error: fileError } = await uploadFile(
      testFile,
      channelData.id,
      null,
      workspaceData.id
    );
    
    if (fileError) {
      throw new Error(`File upload failed: ${fileError.message}`);
    }
    console.log('✅ File upload successful');
    
    // 10. Mark channel as read
    console.log('10. Testing mark channel as read...');
    const { error: readError } = await markChannelAsRead(channelData.id);
    
    if (readError) {
      throw new Error(`Mark channel as read failed: ${readError.message}`);
    }
    console.log('✅ Mark channel as read successful');
    
    // 11. Get unread counts
    console.log('11. Testing unread counts...');
    const { error: unreadError } = await getUnreadCounts(signInData.user.id);
    
    if (unreadError) {
      throw new Error(`Get unread counts failed: ${unreadError.message}`);
    }
    console.log('✅ Get unread counts successful');
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
};

// Run the tests
runTests();

// Export for use in Node.js environment
export default runTests; 