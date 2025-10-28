import OpenAI from 'openai';
import axios from 'axios';

// Test OpenAI package import
async function testOpenAI() {
  console.log('✅ OpenAI SDK imported successfully');
  const client = new OpenAI({ apiKey: 'test-key' });
  console.log('✅ OpenAI client created');
}

// Test axios package import
async function testAxios() {
  console.log('✅ Axios imported successfully');
  // Don't make actual request, just test import
  console.log('✅ Axios client ready');
}

// Test zod package import
async function testZod() {
  const { z } = await import('zod');
  console.log('✅ Zod imported successfully');
  const schema = z.string();
  console.log('✅ Zod schema created');
}

async function main() {
  console.log('🧪 Technology Validation - Hello World POC');
  console.log('==========================================');
  
  try {
    await testOpenAI();
    await testAxios();
    await testZod();
    
    console.log('==========================================');
    console.log('✅ ALL TECHNOLOGY VALIDATION PASSED');
    console.log('🚀 Ready to proceed with implementation');
  } catch (error) {
    console.error('❌ Technology validation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
