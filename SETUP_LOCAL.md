# NextLead n8n Local Setup

## 🚀 Credentials Configuration

### For local development

1. **Start NextLead CRM** on `http://localhost:3000`
2. **Get your API key**:
   - Go to http://localhost:3000/fr/dashboard/settings/automation
   - Copy your API key

3. **Start n8n**:
   ```bash
   npx n8n
   ```

4. **Configure credentials in n8n** (http://localhost:5678):
   - Go to **Credentials** → **Add Credential** → **NextLead API**
   - Fill in:
     - **API Key**: Your local API key
     - **Domain**: `http://localhost:3000`
   - Click **Test** to verify the connection
   - **Save** to save

### For production

1. **Create separate credentials**:
   - **API Key**: Your production API key
   - **Domain**: `https://dashboard.nextlead.app`

## 💡 Best practices

- **Name your credentials**:
  - `NextLead Local` for development
  - `NextLead Production` for production

- **n8n automatically saves** your credentials in an encrypted way
- You won't have to enter them every time

## 🔧 Usage in workflows

1. Create a new workflow
2. Add the **NextLead** node
3. In **Credential for NextLead API**, select:
   - `NextLead Local` to test locally
   - `NextLead Production` for production

## ⚠️ Important notes

- Credentials are stored locally in `~/.n8n/`
- Never commit your API keys
- Use different credentials for each environment
