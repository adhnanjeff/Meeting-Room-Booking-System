# Microsoft Teams Integration Setup Guide

## 🚀 Complete Teams Integration Implementation

This guide will help you set up Microsoft Teams integration for the SynerRoom meeting booking system.

## 📋 Prerequisites

1. **Microsoft 365 Account** with admin privileges
2. **Azure Active Directory** access
3. **Visual Studio** or **.NET 8 SDK**
4. **SQL Server** database

## 🔧 Step 1: Azure AD App Registration

### 1.1 Register Application
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in details:
   - **Name**: `SynerRoom Meeting Booking`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank for now
5. Click **Register**

### 1.2 Configure API Permissions
1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Add these permissions:
   - `Calendars.ReadWrite`
   - `OnlineMeetings.ReadWrite`
   - `User.Read.All`
6. Click **Grant admin consent**

### 1.3 Create Client Secret
1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: `SynerRoom API Secret`
4. Set expiration: `24 months`
5. Click **Add**
6. **Copy the secret value** (you won't see it again!)

### 1.4 Get Configuration Values
Copy these values from your app registration:
- **Application (client) ID**
- **Directory (tenant) ID**
- **Client secret** (from step 1.3)

## 🔧 Step 2: Backend Configuration

### 2.1 Update appsettings.json
Replace the placeholder values in `appsettings.json`:

```json
{
  "AzureAd": {
    "ClientId": "your-actual-client-id-here",
    "ClientSecret": "your-actual-client-secret-here",
    "TenantId": "your-actual-tenant-id-here"
  }
}
```

### 2.2 Install NuGet Packages
Run these commands in your API project:

```bash
dotnet add package Microsoft.Graph
dotnet add package Microsoft.Graph.Auth
dotnet add package Microsoft.Identity.Client
```

### 2.3 Update Database
Run the SQL script to add Teams columns:

```sql
-- Execute add_teams_columns.sql
```

## 🔧 Step 3: Test the Integration

### 3.1 Start the Application
1. Run the backend API
2. Start the Angular frontend
3. Login as a manager

### 3.2 Test Flow
1. **Employee** creates a meeting request
2. **Manager** approves the request
3. **System** automatically:
   - Creates Teams meeting
   - Sends calendar invites
   - Stores Teams join URL
4. **Users** can see "Join Teams Meeting" button

## 🎯 What Happens When Integration Works

### ✅ Automatic Process:
1. **Meeting Request** → Manager approval
2. **Approval** → Backend calls Microsoft Graph API
3. **Graph API** creates:
   - Outlook calendar event
   - Teams meeting link
   - Sends invites to all attendees
4. **Database** stores Teams URL
5. **Frontend** displays join link

### ✅ User Experience:
- **Seamless calendar sync** with Outlook/Teams
- **Automatic invitations** to all attendees
- **One-click join** from SynerRoom app
- **Room booking** appears in Teams calendar

## 🔍 Troubleshooting

### Common Issues:

1. **"Insufficient privileges"**
   - Ensure admin consent is granted for API permissions

2. **"Invalid client secret"**
   - Check if secret has expired
   - Verify correct secret is in appsettings.json

3. **"User not found"**
   - Ensure users have email addresses in the system
   - Check email format matches Microsoft 365

4. **Teams link not appearing**
   - Check browser console for API errors
   - Verify backend is calling Graph API successfully

### Debug Steps:
1. Check API logs for Graph API calls
2. Verify database has Teams columns
3. Test Graph API endpoints directly
4. Ensure users have valid email addresses

## 🎉 Success Indicators

When everything works correctly:
- ✅ Meeting approvals create Teams meetings
- ✅ Attendees receive calendar invites
- ✅ Join links appear in booking details
- ✅ Meetings sync with Teams calendar
- ✅ Room bookings show in Outlook

## 📞 Support

If you encounter issues:
1. Check Azure AD app permissions
2. Verify API configuration
3. Test with a simple meeting first
4. Check network connectivity to Microsoft Graph

---

**🎯 Result**: Full Microsoft Teams integration with automatic meeting creation, calendar sync, and seamless user experience!