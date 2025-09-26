# Security Policy

## 🔒 Reporting Security Vulnerabilities

The Empathy Engine team takes security seriously, especially given the sensitive nature of mental health data. We appreciate your efforts to responsibly disclose security issues.

### 📧 Reporting Process

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@empathy-engine.dev**

Include the following information:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### 🕒 Response Timeline

- **Initial Response**: Within 48 hours
- **Triage**: Within 1 week
- **Fix & Release**: Depends on complexity, typically 2-4 weeks
- **Public Disclosure**: After fix is released and users have had time to update

## 🛡️ Supported Versions

We support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes            |
| 0.9.x   | ✅ Yes            |
| < 0.9   | ❌ No             |

## 🔐 Security Best Practices

### For Users
- Keep your API keys secure and rotate them regularly
- Use environment variables for sensitive configuration
- Enable HTTPS in production environments
- Regularly update to the latest version
- Monitor logs for suspicious activity

### For Contributors
- Never commit secrets, API keys, or credentials
- Use secure coding practices
- Validate all inputs
- Implement proper error handling
- Follow the principle of least privilege

## 🏥 Mental Health Data Protection

### Data Handling
- **No Storage**: We do not store conversation content by default
- **Encryption**: All data in transit is encrypted
- **Anonymization**: Personal information is anonymized where possible
- **Minimal Collection**: We collect only necessary data for functionality

### Privacy Measures
- API keys are never logged
- User conversations are not persisted without explicit consent
- Emotion detection data is processed in real-time and discarded
- No personal health information (PHI) is stored permanently

## 🚨 Known Security Considerations

### API Keys
- Gemini API keys are required for full functionality
- Store keys in environment variables, never in code
- Rotate keys regularly
- Monitor API usage for anomalies

### Data Transmission
- All API calls use HTTPS
- Implement rate limiting to prevent abuse
- Validate and sanitize all inputs
- Use CORS appropriately

### Third-Party Services
- Gemini API (Google): Subject to Google's security policies
- Perplexity API: Subject to Perplexity's security policies
- Expo (Mobile): Follow Expo security best practices

## 📋 Security Checklist

### Deployment Security
- [ ] Environment variables properly configured
- [ ] HTTPS enabled
- [ ] API rate limiting implemented
- [ ] Input validation active
- [ ] Error messages don't leak sensitive information
- [ ] Logging configured appropriately
- [ ] Dependencies updated to latest secure versions

### Development Security
- [ ] No hardcoded secrets
- [ ] Secure random number generation
- [ ] Proper session management
- [ ] XSS protection implemented
- [ ] CSRF protection active
- [ ] SQL injection prevention (if applicable)

## 🔄 Regular Security Updates

### Automated Checks
- Dependabot for dependency updates
- CodeQL for vulnerability scanning
- Regular security audits of npm packages
- Automated testing for security regressions

### Manual Reviews
- Quarterly security reviews
- Annual penetration testing
- Regular code reviews with security focus
- Mental health professional security training

## 📞 Contact Information

### Security Team
- **Email**: security@empathy-engine.dev
- **PGP Key**: Available upon request
- **Response Time**: 48 hours maximum

### General Contact
- **Project Issues**: https://github.com/Sandarsh18/Empathy-engine/issues
- **General Questions**: https://github.com/Sandarsh18/Empathy-engine/discussions

## 🏆 Recognition

We believe in recognizing security researchers who help improve our platform:

### Hall of Fame
Security researchers who responsibly disclose vulnerabilities will be:
- Listed in our Security Hall of Fame (with permission)
- Credited in release notes
- Invited to our security advisory program

### Responsible Disclosure
We follow responsible disclosure practices:
- Coordinate timing of public disclosure
- Provide credit to researchers
- Work together on mitigation strategies
- Share lessons learned with the community

---

## 💚 Mental Health & Security

At Empathy Engine, we recognize that security is not just about protecting data—it's about protecting trust, privacy, and the wellbeing of people seeking mental health support. Every security measure we implement is designed with our users' mental health and privacy in mind.

**Security is a shared responsibility. Thank you for helping us keep Empathy Engine safe and trustworthy.** 🛡️
