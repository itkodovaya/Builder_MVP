"""
Frappe Service API Endpoints

API endpoints for rendering pages and validating blocks
"""

import frappe
from frappe import whitelist
from typing import Dict, List, Any, Optional
from builder.builder.doctype.builder_page.builder_page import BuilderPageRenderer
from builder.utils import Block


@whitelist(allow_guest=True)
def render_page(blocks: List[Dict[str, Any]], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Render a page from blocks
    
    Args:
        blocks: List of block dictionaries
        options: Optional rendering options (inlineCSS, cssPath, metadata)
    
    Returns:
        Dictionary with html, css, and metadata
    """
    try:
        if not Block or not BuilderPageRenderer:
            frappe.throw("Builder module not available")
        
        # Convert dict blocks to Block objects
        block_objects = [Block(**block) for block in blocks]
        
        # Create renderer - simplified approach
        # In a full implementation, we would use BuilderPageRenderer properly
        # For now, we'll use a basic HTML generation
        html = _render_blocks_simple(block_objects)
        
        # Extract CSS (simplified)
        css = _extract_css_simple(block_objects)
        
        # Build response
        response = {
            "html": html,
            "css": css,
        }
        
        # Add metadata if provided
        if options and options.get("metadata"):
            response["metadata"] = options["metadata"]
        
        return response
    
    except Exception as e:
        frappe.log_error(f"Error rendering page: {str(e)}", "FrappeService")
        frappe.throw(f"Failed to render page: {str(e)}")


@whitelist(allow_guest=True)
def validate_blocks(blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validate block structure
    
    Args:
        blocks: List of block dictionaries
    
    Returns:
        Dictionary with valid flag and errors list
    """
    errors = []
    
    try:
        # Basic validation
        if not blocks or len(blocks) == 0:
            errors.append({
                "path": "/",
                "message": "At least one block is required",
                "code": "EMPTY_BLOCKS"
            })
            return {"valid": False, "errors": errors}
        
        # Validate each block
        def validate_block(block: Dict[str, Any], path: str = ""):
            if not block.get("blockId"):
                errors.append({
                    "path": path,
                    "message": "Block must have a blockId",
                    "code": "MISSING_BLOCK_ID"
                })
            
            # Validate children recursively
            if block.get("children"):
                for i, child in enumerate(block["children"]):
                    child_path = f"{path}.children[{i}]" if path else f"children[{i}]"
                    validate_block(child, child_path)
        
        for i, block in enumerate(blocks):
            block_path = f"[{i}]"
            validate_block(block, block_path)
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
    
    except Exception as e:
        frappe.log_error(f"Error validating blocks: {str(e)}", "FrappeService")
        return {
            "valid": False,
            "errors": [{
                "path": "/",
                "message": f"Validation error: {str(e)}",
                "code": "VALIDATION_ERROR"
            }]
        }


@whitelist(allow_guest=True)
def get_templates() -> List[Dict[str, Any]]:
    """
    Get available templates
    
    Returns:
        List of template dictionaries
    """
    try:
        # Get block templates from Frappe
        templates = frappe.get_all(
            "Block Template",
            fields=["name", "block_name", "industry"],
            limit=100
        )
        
        result = []
        for template in templates:
            result.append({
                "id": template.name,
                "name": template.block_name or template.name,
                "industry": template.industry or None,
            })
        
        return result
    
    except Exception as e:
        frappe.log_error(f"Error getting templates: {str(e)}", "FrappeService")
        return []


@whitelist(allow_guest=True)
def preview_page(blocks: List[Dict[str, Any]], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate preview of a page
    
    Args:
        blocks: List of block dictionaries
        options: Optional rendering options
    
    Returns:
        Dictionary with html, css, and assets
    """
    try:
        result = render_page(blocks, options)
        return {
            "html": result["html"],
            "css": result.get("css", ""),
            "assets": {}
        }
    
    except Exception as e:
        frappe.log_error(f"Error generating preview: {str(e)}", "FrappeService")
        frappe.throw(f"Failed to generate preview: {str(e)}")


@whitelist(allow_guest=True)
def health_check() -> Dict[str, Any]:
    """
    Health check endpoint
    
    Returns:
        Dictionary with status
    """
    return {
        "status": "ok",
        "service": "frappe-service",
        "frappe_version": frappe.__version__ if hasattr(frappe, '__version__') else "unknown"
    }


def _render_blocks_simple(blocks: List[Any]) -> str:
    """Simple block rendering (placeholder for full implementation)"""
    html_parts = []
    for block in blocks:
        element = getattr(block, 'element', 'div')
        inner_text = getattr(block, 'innerText', '')
        inner_html = getattr(block, 'innerHTML', '')
        children = getattr(block, 'children', [])
        
        content = inner_html or inner_text
        if children:
            content = _render_blocks_simple(children)
        
        html_parts.append(f"<{element}>{content}</{element}>")
    
    return "\n".join(html_parts)


def _extract_css_simple(blocks: List[Any]) -> str:
    """Simple CSS extraction (placeholder for full implementation)"""
    return "/* CSS extracted from blocks */"

