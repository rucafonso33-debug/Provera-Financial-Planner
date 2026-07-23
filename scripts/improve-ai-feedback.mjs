import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

source = source.replace(
  `    } catch (error) {\n      console.error('AI Analysis error:', error);\n    } finally {`,
  `    } catch (error) {\n      console.error('AI Analysis error:', error);\n      setActionMessage({\n        type: 'error',\n        text: settings.language === 'pt'\n          ? 'Não foi possível concluir a análise de IA. Tenta novamente.'\n          : 'AI analysis could not be completed. Please try again.'\n      });\n    } finally {`
);

source = source.replace(
  `    } catch (error) {\n      console.error('AI Chat error:', error);\n    } finally {`,
  `    } catch (error) {\n      console.error('AI Chat error:', error);\n      setChatHistory(prev => [...prev, {\n        role: 'model',\n        text: settings.language === 'pt'\n          ? 'Não consegui responder agora. Verifica a ligação e tenta novamente.'\n          : 'I could not answer right now. Check the connection and try again.'\n      }]);\n    } finally {`
);

fs.writeFileSync(path, source);
console.log('AI failure feedback applied.');
