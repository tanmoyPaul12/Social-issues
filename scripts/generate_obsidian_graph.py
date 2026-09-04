#!/usr/bin/env python3
"""
Obsidian Graphify Generator v2 — Ethan Nelson "God Mode" Workflow Implementation
Performs deep context extraction & reintegration from raw project files into an interconnected
Obsidian Knowledge Graph. Captures docstrings, class signatures, field definitions, method parameters,
and explicit bidirectional WikiLink dependencies for sub-second LLM graph traversal.
"""

import os
import re
import ast
import pathlib

PROJECT_ROOT = pathlib.Path(__file__).parent.parent.resolve()
KB_DIR = PROJECT_ROOT / "knowlegebase"
ENTITIES_DIR = KB_DIR / "entities"

def ensure_dirs():
    ENTITIES_DIR.mkdir(parents=True, exist_ok=True)

def extract_python_details(file_path):
    """Deep AST extraction of Python classes, methods, docstrings, and imports."""
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        tree = ast.parse(content)
    except Exception:
        return {"docstring": "", "classes": [], "functions": [], "imports": [], "raw_snippet": ""}

    module_doc = ast.get_docstring(tree) or ""
    imports = []
    classes = []
    functions = []

    for node in ast.iter_child_nodes(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name.split('.')[-1])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module.split('.')[-1])
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ClassDef):
            class_doc = ast.get_docstring(node) or ""
            methods = []
            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    args = [a.arg for a in item.args.args if a.arg != 'self']
                    ret = ast.unparse(item.returns) if item.returns else "Any"
                    methods.append(f"{item.name}({', '.join(args)}) -> {ret}")
            classes.append({
                "name": node.name,
                "bases": [ast.unparse(b) for b in node.bases],
                "docstring": class_doc,
                "methods": methods
            })
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            f_doc = ast.get_docstring(node) or ""
            args = [a.arg for a in node.args.args if a.arg != 'self']
            ret = ast.unparse(node.returns) if node.returns else "Any"
            functions.append({
                "name": f"{node.name}({', '.join(args)}) -> {ret}",
                "docstring": f_doc
            })

    # First 30 lines snippet
    snippet_lines = content.splitlines()[:35]
    snippet = "\n".join(snippet_lines)

    return {
        "docstring": module_doc,
        "classes": classes,
        "functions": functions,
        "imports": list(set(imports)),
        "snippet": snippet
    }

def extract_java_details(file_path):
    """Deep extraction of Java class annotations, fields, methods, and package imports."""
    content = file_path.read_text(encoding="utf-8", errors="ignore")
    
    # Class name & annotations
    class_match = re.search(r'(?:public\s+)?(?:class|interface|enum|record)\s+([A-Za-z0-9_]+)', content)
    class_name = class_match.group(1) if class_match else file_path.stem
    
    annotations = re.findall(r'(@[A-Za-z0-9_]+(?:\([^)]*\))?)', content)
    imports = re.findall(r'import\s+[a-zA-Z0-9_.]+\.([A-Za-z0-9_]+);', content)
    
    # Extract fields
    fields = re.findall(r'(?:private|protected|public)\s+([A-Za-z0-9_<>?, ]+)\s+([A-Za-z0-9_]+)\s*;', content)
    formatted_fields = [f"{f_type.strip()} {f_name.strip()}" for f_type, f_name in fields[:15]]

    # Extract methods
    methods = re.findall(r'(?:public|protected|private)\s+(?:async\s+)?([A-Za-z0-9_<>?]+)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)', content)
    formatted_methods = [f"{ret.strip()} {m_name}({args.strip()})" for ret, m_name, args in methods[:15]]

    snippet = "\n".join(content.splitlines()[:35])

    return {
        "class_name": class_name,
        "annotations": list(set(annotations[:8])),
        "imports": list(set(imports)),
        "fields": formatted_fields,
        "methods": formatted_methods,
        "snippet": snippet
    }

def extract_tsx_details(file_path):
    """Deep extraction of React/TSX components, props, and imports."""
    content = file_path.read_text(encoding="utf-8", errors="ignore")
    
    imports = re.findall(r'import\s+.*?from\s+[\'"](.*?)[\'"]', content)
    components = re.findall(r'export\s+(?:default\s+)?(?:function|const)\s+([A-Za-z0-9_]+)', content)
    hooks = re.findall(r'(use[A-Z][A-Za-z0-9_]+)', content)
    
    snippet = "\n".join(content.splitlines()[:30])

    return {
        "imports": [i.split('/')[-1] for i in imports if not i.startswith('.')],
        "components": components,
        "hooks": list(set(hooks)),
        "snippet": snippet
    }

def process_python_files():
    ai_dir = PROJECT_ROOT / "ai-service" / "app"
    if not ai_dir.exists():
        return []

    generated_entities = []
    for root, _, files in os.walk(ai_dir):
        for file in files:
            if file.endswith(".py") and not file.startswith("__"):
                py_path = pathlib.Path(root) / file
                rel_path = py_path.relative_to(PROJECT_ROOT)
                entity_name = file[:-3]

                details = extract_python_details(py_path)
                
                tags = ["ai-service", "python"]
                if "preprocessing" in str(rel_path):
                    tags.append("preprocessing")
                elif "validation" in str(rel_path):
                    tags.append("validation")
                elif "categorization" in str(rel_path):
                    tags.append("categorization")
                elif "deduplication" in str(rel_path):
                    tags.append("deduplication")
                elif "prioritization" in str(rel_path):
                    tags.append("prioritization")

                # Build wikilink targets for imports
                import_links = [f"[[{imp}]]" for imp in details["imports"] if len(imp) > 3][:12]

                class_blocks = []
                for cls in details["classes"]:
                    methods_str = "\n".join(f"  - `{m}`" for m in cls["methods"]) if cls["methods"] else "  - No public methods"
                    doc_str = f"> {cls['docstring']}" if cls['docstring'] else ""
                    class_blocks.append(f"### Class `{cls['name']}`\n**Inherits**: `{', '.join(cls['bases']) or 'Object'}`\n{doc_str}\n\n**Methods**:\n{methods_str}")

                func_blocks = []
                for fn in details["functions"]:
                    doc_str = f"  > {fn['docstring']}" if fn['docstring'] else ""
                    func_blocks.append(f"- `{fn['name']}`\n{doc_str}")

                entity_doc = f"""---
id: {entity_name}
title: "Python Module: {entity_name}"
type: code-entity
component: ai-service
path: "{rel_path}"
tags:
{chr(10).join(f"  - {t}" for t in tags)}
moc: "[[MOC_AI_Service]]"
---

# 🟣 Module: `{entity_name}`

**Source Path**: `{rel_path}`  
**Parent MOC**: [[MOC_AI_Service]]  
**Architecture Spec**: [[preprocessing]]  

---

## 📝 Module Overview
{details['docstring'] or 'No module-level docstring provided.'}

---

## 🧩 Class Definitions & Signatures
{chr(10).join(class_blocks) if class_blocks else "No classes defined in this module."}

---

## ⚡ Standalone Functions
{chr(10).join(func_blocks) if func_blocks else "No standalone functions defined."}

---

## 🔗 Extracted Graph Dependencies & Wikilinks
**Imported / Connected Nodes**:
{', '.join(import_links) if import_links else "No external module wikilinks."}

- System Architecture: [[technical_architecture]]
- Master AI Spec: [[preprocessing]]
- Model Manager: [[model_manager]]

---

## 📜 Source Excerpt (Context Reintegrated)
```python
{details['snippet']}
```
"""
                (ENTITIES_DIR / f"{entity_name}.md").write_text(entity_doc, encoding="utf-8")
                generated_entities.append(entity_name)

    return generated_entities

def process_java_files():
    backend_dir = PROJECT_ROOT / "backend" / "src"
    if not backend_dir.exists():
        return []

    generated_entities = []
    for root, _, files in os.walk(backend_dir):
        for file in files:
            if file.endswith(".java"):
                java_path = pathlib.Path(root) / file
                rel_path = java_path.relative_to(PROJECT_ROOT)
                entity_name = file[:-5]

                details = extract_java_details(java_path)

                tags = ["backend", "java", "spring-boot"]
                if "dto" in str(rel_path).lower():
                    tags.append("schema")
                elif "controller" in str(rel_path).lower():
                    tags.append("controller")
                elif "repository" in str(rel_path).lower():
                    tags.append("database")

                import_links = [f"[[{imp}]]" for imp in details["imports"] if len(imp) > 3][:12]

                entity_doc = f"""---
id: {entity_name}
title: "Java Class: {entity_name}"
type: code-entity
component: backend
path: "{rel_path}"
tags:
{chr(10).join(f"  - {t}" for t in tags)}
moc: "[[MOC_Backend_Java]]"
---

# 🔵 Java Component: `{entity_name}`

**Source Path**: `{rel_path}`  
**Parent MOC**: [[MOC_Backend_Java]]  

---

## 🏷️ Annotations
{', '.join(f'`{a}`' for a in details['annotations']) if details['annotations'] else 'None'}

---

## 📦 Fields & Properties (Schema Context)
{chr(10).join(f"- `{f}`" for f in details['fields']) if details['fields'] else "No private fields extracted."}

---

## ⚡ Method Signatures
{chr(10).join(f"- `{m}`" for m in details['methods']) if details['methods'] else "No public methods extracted."}

---

## 🔗 Extracted Graph Dependencies & Wikilinks
**Imported / Connected Nodes**:
{', '.join(import_links) if import_links else "No external wikilinks."}

- Backend Architecture MOC: [[MOC_Backend_Java]]
- Main System Spec: [[technical_architecture]]
- Security Policy: [[security_access]]

---

## 📜 Source Excerpt (Context Reintegrated)
```java
{details['snippet']}
```
"""
                (ENTITIES_DIR / f"{entity_name}.md").write_text(entity_doc, encoding="utf-8")
                generated_entities.append(entity_name)

    return generated_entities

def process_frontend_files():
    frontend_dir = PROJECT_ROOT / "frontend" / "src"
    if not frontend_dir.exists():
        frontend_dir = PROJECT_ROOT / "frontend" / "web" / "src"
    if not frontend_dir.exists():
        return []

    generated_entities = []
    for root, _, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith((".tsx", ".jsx", ".ts")):
                ts_path = pathlib.Path(root) / file
                rel_path = ts_path.relative_to(PROJECT_ROOT)
                entity_name = file.rsplit('.', 1)[0]
                if entity_name in ["page", "layout", "route"]:
                    entity_name = f"{ts_path.parent.name}_{entity_name}"

                details = extract_tsx_details(ts_path)

                import_links = [f"[[{imp}]]" for imp in details["imports"] if len(imp) > 3][:10]

                entity_doc = f"""---
id: {entity_name}
title: "Frontend Component: {entity_name}"
type: code-entity
component: frontend
path: "{rel_path}"
tags:
  - frontend
  - nextjs
  - react
moc: "[[MOC_Frontend_Next]]"
---

# 🟢 Component: `{entity_name}`

**Source Path**: `{rel_path}`  
**Parent MOC**: [[MOC_Frontend_Next]]  

---

## 🧩 Exported Components & Hooks
- **Components**: {', '.join(f'`{c}`' for c in details['components']) if details['components'] else 'Default module'}
- **Hooks**: {', '.join(f'`{h}`' for h in details['hooks']) if details['hooks'] else 'None'}

---

## 🔗 Connected Graph Nodes
{', '.join(import_links) if import_links else "No external node wikilinks."}

- Frontend Specification: [[frontend_spec]]
- Architecture Spec: [[technical_architecture]]

---

## 📜 Source Excerpt (Context Reintegrated)
```tsx
{details['snippet']}
```
"""
                (ENTITIES_DIR / f"{entity_name}.md").write_text(entity_doc, encoding="utf-8")
                generated_entities.append(entity_name)

    return generated_entities

def generate_llm_context_map(ai_entities, java_entities, fe_entities):
    """Generates LLM_CONTEXT_MAP.md for zero-overhead graph traversal by AI agents."""
    map_doc = f"""---
id: LLM_CONTEXT_MAP
title: "LLM Context Map — Graphify Fast Navigation Index"
tags:
  - docs
  - llm-map
  - graphify
updated: 2026-09-04
---

# ⚡ LLM Context Map (Sub-Second Token Navigation)

This document serves as the high-density index for AI agents (Claude Code, Antigravity, LLM agents) to navigate the **Social-issues Knowledge Graph** via graph traversal instead of repository-wide brute force searches.

---

## 🗺️ Master Maps of Content (MOCs)
- [[MOC_System_Architecture]] — System Overview, End-to-End Data Pipeline Flow
- [[MOC_AI_Service]] — FastAPI Multimodal Intelligence & Preprocessing Service
- [[MOC_Backend_Java]] — Spring Boot Core Backend & Database Transaction Service
- [[MOC_Frontend_Next]] — Next.js Citizen & Admin Web Portal

---

## 🟣 AI Microservice Nodes (`ai-service/app/`)
{chr(10).join(f"- [[{e}]]" for e in sorted(ai_entities))}

---

## 🔵 Java Spring Boot Nodes (`backend/src/`)
{chr(10).join(f"- [[{e}]]" for e in sorted(java_entities))}

---

## 🟢 Frontend Web Nodes (`frontend/`)
{chr(10).join(f"- [[{e}]]" for e in sorted(fe_entities)) if fe_entities else "- Specs documented in [[frontend_spec]]"}

---

## 📚 Core System Architecture Documents
- [[technical_architecture]] — Full technical specification
- [[preprocessing]] — Preprocessing layer architecture plan
- [[frontend_spec]] — UI/UX specification & design system
- [[security_access]] — Role-Based Access Control (RBAC) & security policy
- [[auth]] — Authentication & session management specs
- [[project]] — Vision & core problem statement
- [[feature_ticket_list]] — Ticket roadmap
"""
    (KB_DIR / "LLM_CONTEXT_MAP.md").write_text(map_doc, encoding="utf-8")
    print("Generated: knowlegebase/LLM_CONTEXT_MAP.md")

def main():
    print("🚀 Initializing Obsidian Graphify v2 Context Reintegration Generator...")
    ensure_dirs()
    ai_entities = process_python_files()
    java_entities = process_java_files()
    fe_entities = process_frontend_files()
    generate_llm_context_map(ai_entities, java_entities, fe_entities)
    print("✅ Obsidian Graphify v2 God Mode Knowledge Base generated successfully!")

if __name__ == "__main__":
    main()
